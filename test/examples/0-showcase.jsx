import React from "react";
import WidthProvider from "../../lib/components/WidthProvider";
import Responsive from "../../lib/ResponsiveReactGridLayout";
import _ from "lodash";

require("./Puzzler/Puzzler").default();
require("./Puzzler/PuzzleGame").default();
const ResponsiveReactGridLayout = WidthProvider(Responsive);
/**
 * This layout demonstrates how to use a grid with a dynamic number of elements.
 */
let getContainerFunc;

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}
const heights = [{ d: 2, s: 0.8, m: 1 }, { d: 200, s: 80, m: 100 }];

window.getContainerFuncHeight = (canvas = false) => {
    const _h = heights[canvas ? 1 : 0];
    let h = _h.d;
    if (window.innerWidth < 1200) {
        const mini = window.innerWidth < 600 ? _h.s : false;
        const small = window.innerWidth > 600 ? _h.m : false;
        h = mini || small || h;
    } else {
        h = _h.d;
    }
    return h;
};
const MAX_ITEMS = 18;
export default class AddRemoveLayout extends React.Component {
    static defaultProps = {
        className: "layout",
        cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
        rowHeight: 100
    };

    constructor(props) {
        super(props);
        this.state = {
            items: [],
            newCounter: 0,
            containers: []
        };
        this.refsC = {};
        this.onBreakpointChange = this.onBreakpointChange.bind(this);
    }

    componentDidMount() {
        if (Puzzler.support()) {
            var form = document.getElementById("form");
            form.addEventListener("submit", this.onSubmit, false);
        } else {
            document.body.innerHTML = "<h1>Sorry, but you browser doesn't support \"Canvas\". Please, use modern browser such as Firefox, Opera, Safari or Chrome</h1>";
        }
    }

    rerender = (upd = false) => {
        if (getContainerFunc) {
            if (upd) {
                let items = [];
                for (let i = 0; i < MAX_ITEMS; i += 1) {
                    items = this.onAddItem(items);
                }
                this.setState({ items }, () => {
                    this.canvasDraw();
                });
            } else {
                this.canvasDraw();
            }
        }
    };
    canvasDraw = () => {
        const { containers } = this.state;
        const ww = this.refsC[`testn0`].clientWidth;
        let item1 = 0;
        for (let i = 0; i < containers.length; i += 1) {
            const iitem = containers[i];
            const cc = getContainerFunc(iitem.x, iitem.y, iitem.w, iitem.h, true, ww);
            this.refsC[`testn${item1}`].appendChild(cc.container);
            item1 += 1;
        }
    };

    createElement(el) {
        const i = el.i;
        return (
                <div key={i} data-grid={el}>
                    <div ref={eel => this.refsC[`test${i}`] = eel}>
                    </div>
                </div>
        );
    }

    onSubmit = (e) => {
        if (e) {
            e.preventDefault();
        }
        // this.style.display = 'none';
        var url = "img.jpg";
        var dest = document.createElement("div");
        dest.id = "dest";
        dest.className = "dest";
        dest.innerHTML = "Loading image...";
        document.body.appendChild(dest);
        let items = [];
        for (let i = 0; i < MAX_ITEMS; i += 1) {
            items = this.onAddItem(items);
        }
        new PuzzleGame(dest, url, false, (images, countY, countX, getContainer, containers) => {
            getContainerFunc = getContainer;
            const arr = [];
            Object.keys(containers).forEach(i => {
                arr.push(containers[i]);
            });
            shuffle(arr);
            this.setState({ items, containers: arr }, () => {
                this.rerender();
            });
        });


    };
    getHeight = () => {
        const wh = this.refsC[`testn0`]?.clientWidth;
        if (wh) {
            return wh;
        }
        const h = window.getContainerFuncHeight();
        return h;
    };
    onAddItem = (items = false) => {
        /*eslint no-console: 0*/
        // console.log(this.refsC)
        if (items && Array.isArray(items)) {
            items = items.concat({
                i: "n" + items.length,
                x: (items.length * 2) % (this.state.cols || 12),
                y: Infinity, // puts it at the bottom
                w: 2,
                h: this.getHeight(),
                minH: 0.8,
                isResizable: false,
            });
            return items;
        }
        // console.log("adding", "n" + this.state.newCounter);

        this.setState({
            // Add a new item. It must have a unique key!
            items: this.state.items.concat({
                i: "n" + this.state.newCounter,
                x: (this.state.items.length * 2) % (this.state.cols || 12),
                y: Infinity, // puts it at the bottom
                w: 2,
                h: 2
            }),
            // Increment the counter to ensure key is always unique.
            newCounter: this.state.newCounter + 1
        });
    };

    // We're using the cols coming back from this to calculate where to add new items.
    onBreakpointChange(breakpoint, cols) {
        console.log("tes", cols, window.innerWidth);
        this.setState({
            breakpoint: breakpoint,
            cols: cols,
            items: []
        }, () => {
            this.rerender(true);
        });
    }

    onLayoutChange(layout) {
        this.props.onLayoutChange(layout);
        this.setState({ layout: layout });
    }

    render() {
        return (
                <div className="center">
                    {this.state.items.length === 0 ? (
                            <button className="btn" onClick={this.onSubmit}>
                                Начать игру
                            </button>
                    ) : null}
                    <ResponsiveReactGridLayout
                            margin={[3,3]}
                            onLayoutChange={this.onLayoutChange}
                            onBreakpointChange={this.onBreakpointChange}
                            {...this.props}
                            cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
                    >
                        {_.map(this.state.items, el => this.createElement(el))}
                    </ResponsiveReactGridLayout>
                </div>
        );
    }
}

if (process.env.STATIC_EXAMPLES === true) {
    import("../test-hook.jsx").then(fn => fn.default(AddRemoveLayout));
}
