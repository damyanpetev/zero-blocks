import { Inject, Injectable, InjectionToken, NgZone } from "@angular/core";
import { DOCUMENT, HAMMER_GESTURE_CONFIG, HammerGestureConfig } from "@angular/platform-browser";
import { EventManagerPlugin } from "@angular/platform-browser/src/dom/events/event_manager";

const EVENT_PREFIX = "igx-";

/**
 * TODO
 */
export const IGX_HAMMER_OPTIONS = new InjectionToken<HammerOptions>("HammerOptions");

/**
 * Touch gestures manager based on Hammer.js
 * Use with caution, this will track references for single manager per element. Very TBD. Much TODO.
 */
@Injectable()
export class HammerGesturesManager extends EventManagerPlugin {
    /**
     * Event option defaults for each recognizer, see http://hammerjs.github.io/api/ for API listing.
     */
    protected hammerOptions: HammerOptions = {
        // D.P. #447 Force TouchInput due to PointerEventInput bug (https://github.com/hammerjs/hammer.js/issues/1065)
        // see https://github.com/IgniteUI/igniteui-angular/issues/447#issuecomment-324601803
        inputClass: Hammer.TouchInput,
        recognizers: [
            [ Hammer.Pan, { threshold: 0 } ],
            [ Hammer.Pinch, { enable: true } ],
            [ Hammer.Rotate, { enable: true } ],
            [ Hammer.Swipe, {
                direction: Hammer.DIRECTION_HORIZONTAL
            }]
        ]
    };

    private _hammerManagers: Array<{ element: EventTarget, manager: HammerManager; }> = [];

    constructor(
            @Inject(DOCUMENT) doc: any,
            @Inject(IGX_HAMMER_OPTIONS) private options: HammerOptions) {
        super(doc);
        if (this.options) {
            Object.assign(this.hammerOptions, this.options);
        }
    }

    public supports(eventName: string): boolean {
        return eventName.toLowerCase().startsWith(EVENT_PREFIX);
    }

    /**
     * Add listener extended with options for Hammer.js. Will use defaults if none are provided.
     * Modeling after other event plugins for easy future modifications.
     */
    public addEventListener(element: HTMLElement,
                            eventName: string,
                            eventHandler: (eventObj) => void,
                            options: object = null): () => void {
        const zone = this.manager.getZone();
        eventName = eventName.replace(EVENT_PREFIX, "");

        // Creating the manager bind events, must be done outside of angular
        return this.manager.getZone().runOutsideAngular(() => {
            let mc: HammerManager = this.getManagerForElement(element);
            if (mc === null) {
                // new Hammer is a shortcut for Manager with defaults
                mc = new Hammer(element, this.hammerOptions);
                this.addManagerForElement(element, mc);
            }
            const handler = (eventObj) => { zone.run(() => { eventHandler(eventObj); }); };
            mc.on(eventName, handler);
            return () => { mc.off(eventName, handler); };
        });
    }

    /**
     * Set HammerManager options.
     *
     * @param element The DOM element used to create the manager on.
     *
     * ### Example
     *
     * ```ts
     * manager.setManagerOption(myElem, "pan", { pointers: 1 });
     * ```
     */
    public setManagerOption(element: EventTarget, event: string, options: any) {
        const manager = this.getManagerForElement(element);
        manager.get(event).set(options);
    }

    /**
     * Add an element and manager map to the internal collection.
     *
     * @param element The DOM element used to create the manager on.
     */
    public addManagerForElement(element: EventTarget, manager: HammerManager) {
        this._hammerManagers.push({element, manager});
    }

    /**
     * Get HammerManager for the element or null
     *
     * @param element The DOM element used to create the manager on.
     */
    public getManagerForElement(element: EventTarget): HammerManager {
        const result =  this._hammerManagers.filter((value, index, array) => {
            return value.element === element;
        });
        return result.length ? result[0].manager : null;
    }

    /**
     * Destroys the HammerManager for the element, removing event listeners in the process.
     *
     * @param element The DOM element used to create the manager on.
     */
    public removeManagerForElement(element: HTMLElement) {
        let index: number = null;
        for (let i = 0; i < this._hammerManagers.length; i++) {
            if (element === this._hammerManagers[i].element) {
                index = i;
                break;
            }
        }
        if (index !== null) {
            const item = this._hammerManagers.splice(index, 1)[0];
            // destroy also
            item.manager.destroy();
        }
    }

    /** Destroys all internally tracked HammerManagers, removing event listeners in the process. */
    public destroy() {
        for (const item of this._hammerManagers) {
            item.manager.destroy();
        }
        this._hammerManagers = [];
    }
}
