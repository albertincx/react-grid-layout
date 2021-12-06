import React from "react";
import _ from "lodash";

import WidthProvider from "../../lib/components/WidthProvider";
import Responsive from "../../lib/ResponsiveReactGridLayout";
import Gallery from "./Gallery";

require("./Puzzler/Puzzler").default();
require("./Puzzler/PuzzleGame").default();
require("./conf").default();
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

const heights = [{ d: 2, s2: 0.6, s: 0.9, m: 1, m2: 1.5 }, { d: 200, s2: 60, s: 90, m: 100, m2: 150 }];

window.getContainerFuncHeight = (canvas = false) => {
    const _h = heights[canvas ? 1 : 0];
    let h = _h.d;
    if (window.innerWidth < 1200) {
        // const mini2 = window.innerWidth < 400 ? _h.s2 : false;
        const mini = window.innerWidth < 600 ? _h.s : false;
        const small = window.innerWidth > 600 ? _h.m : false;
        const small2 = window.innerWidth > 800 ? _h.m2 : false;
        h = small2 || small || mini || h;
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
            baseArr: [],
            items: [],
            newCounter: 0,
            containers: [],
            loader: false,
            soundOn: true,
            win: false,
            timeStart: new Date().getTime(),
            timeEnd: 0
            // img: "cartoon/img5.jpg",
        };
        this.checkPositions = [
            0, 2, 4, 6, 8, 10,
            0, 2, 4, 6, 8, 10,
            0, 2, 4, 6, 8, 10
        ];
        this.positions = null;
        this.refsC = {};
        this.onBreakpointChange = this.onBreakpointChange.bind(this);
        this.onDragStop = this.onDragStop.bind(this);
    }

    componentDidMount() {
        // eslint-disable-next-line no-undef
        if (Puzzler.support()) {
            //
            // this.onSubmit();
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
        if (!this.refsC[`testn0`]) {
            return;
        }
        const ww = this.refsC[`testn0`].clientWidth;
        let item1 = 0;
        for (let i = 0; i < containers.length; i += 1) {
            const iitem = containers[i];
            const cc = getContainerFunc(iitem.x, iitem.y, iitem.w, iitem.h, true, ww);
            this.refsC[`testn${item1}`]?.appendChild(cc.container);
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

    onBack = (e) => {
        e.preventDefault();
        this.play();
        this.setState({ items: [], img: "", win: false });
    };
    onBack2 = (e) => {
        e.preventDefault();
        this.play();
        this.setState({ items: [], dir: false });
    };

    youWin = (win) => {
        var dt2 = new Date();
        var diff = (dt2.getTime() - this.state.timeStart);
        var hours = Math.floor(diff / (1000 * 60 * 60));
        diff -= hours * (1000 * 60 * 60);
        var mins = Math.floor(diff / (1000 * 60));
        var sec = Math.floor(diff / (1000));
        // diff -= mins * (1000 * 60);
        // outputs: "00:39:30"
        const h = `${hours < 10 ? "0" : ""}${hours}`;
        const m = `${mins < 10 ? "0" : ""}${mins}`;
        const s = `${sec < 10 ? "0" : ""}${sec}`;
        this.play("2");
        this.setState({ win: win || true, timeEnd: `${h}:${m}:${s}` });
        window.confetti.start();
    };

    onSuffle = (e) => {
        if (e) {
            e.preventDefault();
        }
        this.onSubmit(null, true);
    };
    onSubmit = (e, shuf = false) => {
        if (e) {
            e.preventDefault();
        }
        this.play();
        if (shuf) {
            const { baseArr } = this.state;
            this.setState({ loader: true, items: [] });
            setTimeout(() => {
                const arr = [...baseArr];
                shuffle(arr);
                let items = [];
                for (let i = 0; i < arr.length; i += 1) {
                    items = this.onAddItem(items);
                }
                this.positions = null;
                this.setState({
                    loader: false,
                    items,
                    containers: arr,
                    timeStart: new Date().getTime()
                }, () => {
                    this.rerender();
                });
            }, 500);
            return;
        }
        this.positions = null;
        this.setState({ loader: true });
        var url = this.state.img || "cartoon/img5.jpg";
        var dest = document.createElement("div");
        dest.id = "dest";
        dest.className = "dest";
        document.body.appendChild(dest);
        // eslint-disable-next-line no-undef
        new PuzzleGame(dest, url, false, (images, countY, countX, getContainer, containers) => {
            getContainerFunc = getContainer;
            const arr = [];
            let items = [];
            Object.keys(containers).forEach(i => {
                containers[i].baseName = i;
                arr.push({ ...containers[i] });
            });
            const baseArr = [...arr];
            if (!window || !window.__shuffle_disable) {
                shuffle(arr);
            }
            for (let i = 0; i < arr.length; i += 1) {
                items = this.onAddItem(items, arr[i].baseName);
            }
            window.confetti.stop();
            this.setState({ items, containers: arr, loader: false, baseArr }, () => {
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
        // console.log("h ", h);
        return h;
    };
    setPos = (c) => {
        if (this.positions) {
            return;
        }

        const pos = [];
        for (let f = 0; f < c.length; f += 1) {
            if (!pos.includes(c[f].y)) {
                pos.push(c[f].y);
            }
        }
        this.positions = [pos[0], pos[1], pos[2]];
    };

    checkItem = (c, f) => {
        let yT = this.positions[0];
        for (let i = 0; i < c.length; i += 1) {
            const cc = c[i];
            const ccB = cc.baseName.replace("item", "");
            if (ccB === `${f}`) {
                if (i > 5) {
                    yT = this.positions[1];
                }
                if (i > 11) {
                    yT = this.positions[2];
                }
                if (cc.x === this.checkPositions[f] && cc.y === yT) {
                    return true;
                }
                break;
            }
        }
    };
    checkLayout = (c) => {
        let match = 0;
        this.setPos(c);

        for (let i = 0; i < c.length; i += 1) {
            if (this.checkItem(c, i)) {
                match += 1;
            }
        }
        return match === c.length;
    };

    onDragStop(c) {
        if (this.checkLayout(c)) {
            this.youWin();
        }
        this.play();
    }

    onAddItem = (items = false, baseName = "") => {
        if (items && Array.isArray(items)) {
            items = items.concat({
                i: "n" + items.length,
                x: (items.length * 2) % (this.state.cols || 12),
                y: Infinity, // puts it at the bottom
                w: 2,
                h: this.getHeight(),
                minH: 0.8,
                isResizable: false,
                onDragStop: this.onDragStop,
                baseName
            });
            return items;
        }

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

    onSelect = (el) => {
        let field = "img";
        if (!el.src) {
            field = "dir";
        }
        this.play();
        this.setState({ [field]: el.src ? el.src : el }, () => {
            if (el.src) {
                this.onSubmit();
            }
        });
    };
    play = (idStr = "") => {
        if (!this.state.soundOn) {
            return;
        }
        const a = document.getElementById("audio" + idStr);
        if (a) {
            a.play();
        }
    };
    onSoundToggle = () => {
        this.setState({ soundOn: !this.state.soundOn });
    };

    render() {
        return (
                <div className="center1">
                    <div className="center2">
                        {this.state.items.length === 0 ? (
                                <div className="center">
                                    {this.state.loader ? <div className="new container progress-6" /> : null}
                                    {this.state.dir ? (
                                            <div className="center">
                                                <div className="btn text text-3" onClick={this.onBack2}>
                                                    Назад
                                                </div>
                                            </div>
                                    ) : null}
                                </div>
                        ) : (
                                <div className="center3">
                                    <div className="btn text text-3" onClick={this.onBack}>
                                        Назад
                                    </div>
                                    {!this.state.win ? (
                                            <div className="btn text text-3" onClick={this.onSuffle}>
                                                Рестарт
                                            </div>
                                    ) : null}
                                    <div onClick={this.onSoundToggle}
                                         className={this.state.soundOn ? "sound sound-on" : "sound sound-off"} />
                                </div>
                        )}
                        <Gallery onSelect={this.onSelect} dir={this.state.dir} img={this.state.img} />
                        {this.state.win ? (
                                <div className="wrapper">
                                    <div className="modal">
                                        <span className="emoji round">🏆</span>
                                        <h1>Поздравляем</h1>
                                        <h1>Время: {this.state.timeEnd}</h1>
                                        <a href="#" className="modal-btn" onClick={this.endGame}>Рестарт</a>
                                    </div>
                                    <div id="confetti-wrapper">
                                    </div>
                                </div>
                        ) : null}
                        <div className="game">
                            <ResponsiveReactGridLayout
                                    onDragStop={this.onDragStop}
                                    margin={[3, 3]}
                                    onLayoutChange={this.onLayoutChange}
                                    onBreakpointChange={this.onBreakpointChange}
                                    {...this.props}
                                    cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
                            >
                                {_.map(this.state.items, el => this.createElement(el))}
                            </ResponsiveReactGridLayout>
                        </div>
                    </div>
                    <div>
                        <br />
                        <br />
                    </div>
                </div>
        );
    }

    endGame = () => {
        window.confetti.stop();
        this.setState({ win: false }, () => {
            this.onSuffle();
        });
    };
}

if (process.env.STATIC_EXAMPLES === true) {
    import("../test-hook.jsx").then(fn => fn.default(AddRemoveLayout));
}
