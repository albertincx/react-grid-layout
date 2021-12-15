import React from "react";
import _ from "lodash";

import WidthProvider from "../../lib/components/WidthProvider";
import Responsive from "../../lib/ResponsiveReactGridLayout";
import Gallery, { srcs } from "./Gallery";

require("./Puzzler/Puzzler").default();
require("./Puzzler/PuzzleGame").default();
require("./Puzzler/conf").default();
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

window.getHeight = (canvas = false) => {
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
export default class AddRemoveLayout extends React.Component {
    static defaultProps = {
        className: "layout",
        cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
        rowHeight: 100
    };

    constructor(props) {
        super(props);
        const ua = navigator.userAgent;
        this.state = {
            items: [],
            newCounter: 0,
            containers: [],
            loader: false,
            soundOn: true,
            win: false,
            timeStart: new Date().getTime(),
            timeEnd: 0,
            isSB: ua.toLowerCase().includes("sberbox")
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
        this.moved = {};
    }

    componentDidMount() {
        // eslint-disable-next-line no-undef
        if (Puzzler.support()) {
        } else {
            document.body.innerHTML = "<h1>Sorry, but you browser doesn't support \"Canvas\". Please, use modern browser such as Firefox, Opera, Safari or Chrome</h1>";
        }
    }

    rerender = (shuffleOn = false) => {
        const { containers } = this.state;
        const arr = [...containers];
        if (shuffleOn && !(window && window.__shuffle_disable)) {
            shuffle(arr);
        }
        let items = [];
        for (let i = 0; i < arr.length; i += 1) {
            items = this.onAddItem(items, arr[i].baseName);
        }
        this.setState({ items, containers: arr }, () => {
            this.canvasDraw();
        });
    };

    canvasDraw = () => {
        const { containers } = this.state;
        if (!this.refsC[`testn0`] || !getContainerFunc) {
            return;
        }
        const ww = this.refsC[`testn0`].clientWidth;
        let item1 = 0;
        for (let i = 0; i < containers.length; i += 1) {
            const iitem = containers[i];
            const cc = getContainerFunc(iitem.x, iitem.y, iitem.w, iitem.h, true, ww, iitem.baseName);
            const cAnv = cc.container.querySelectorAll("canvas")[0];
            var dataURLA = cAnv.toDataURL();
            const imgA = new Image();
            imgA.src = dataURLA;
            this.refsC[`testn${item1}`]?.appendChild(cc.container);
            const cB = this.refsC[`testn${item1}`].querySelectorAll("canvas")[0];
            const cBc = cB.getContext("2d");
            cBc.drawImage(imgA, 0, 0);
            item1 += 1;
        }
    };

    onClick = (indx) => (el) => {
        const { click1, isSB } = this.state;
        if (!isSB) {
            return;
        }
        const newIndx = `${indx}`;
        if (click1 === newIndx) {
            return;
        }
        if (click1) {
            this.replaceItems(click1, indx);
            return;
        }
        this.setState({ click1: newIndx });
    };

    replaceItems = (a, b) => {
        const cellAInt = parseInt(a);
        const cellBInt = parseInt(b);
        const baseNameA = `testn${cellAInt}`;
        const baseNameB = `testn${cellBInt}`;
        if (this.refsC[baseNameA] && this.refsC[baseNameB]) {
            let cA = this.refsC[baseNameA].querySelectorAll("canvas")[0];
            let cB = this.refsC[baseNameB].querySelectorAll("canvas")[0];
            var dataURLA = cA.toDataURL();
            var dataURLB = cB.toDataURL();
            const imgA = new Image();
            const imgB = new Image();
            imgA.src = dataURLA;
            imgB.src = dataURLB;
            const cBc = cB.getContext("2d");
            const cAc = cA.getContext("2d");
            cBc.drawImage(imgA, 0, 0);
            cAc.drawImage(imgB, 0, 0);
        }
        this.setState({
            click1: "",
            click2: ""
        });
    };

    createElement(el) {
        const i = el.i;
        const ind = i.replace("n", "");
        return (
                <div tabIndex={ind} key={i} data-grid={el} onClick={this.onClick(ind)}>
                    <div ref={eel => this.refsC[`test${i}`] = eel} />
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

    randomPuzzle = (e, state) => {
        const add = Object.keys(srcs);
        shuffle(add);
        const dir = this.state.dir?.name || add[0];
        const add2 = srcs[dir];
        shuffle(add2);
        const ind = add2[0];
        const img = { rand: true, src: `${dir}/img${ind}.jpg`, dir, ii: ind };
        let newState = { img };
        if (state) {
            if (state.rand) {
                newState.win = false;
            } else {
                newState = state;
            }
        }
        this.setState(newState, () => {
            this.onSubmit();
        });
    };
    onSubmit = (e, shuf = false) => {
        if (e) {
            e.preventDefault();
        }
        this.play();
        this.positions = null;
        this.setState({ loader: true });
        var url = this.state.img?.src || "cartoon/img5.jpg";
        var dest = document.createElement("div");
        dest.id = "dest";
        dest.className = "dest";
        document.body.appendChild(dest);
        // eslint-disable-next-line no-undef
        new PuzzleGame(dest, url, false, (images, countY, countX, getContainer, containers) => {
            getContainerFunc = getContainer;
            window.confetti.stop();
            const arr = [];
            Object.keys(containers).forEach(i => {
                containers[i].baseName = i;
                arr.push({ ...containers[i] });
            });
            this.setState({ containers: arr, loader: false }, () => {
                this.rerender(true);
            });
        });


    };
    getHeight = () => {
        return window.getHeight();
    };
    setPos = (c) => {
        const pos = [];
        for (let f = 0; f < c.length; f += 1) {
            if (!pos.includes(c[f].y)) {
                pos.push(c[f].y);
            }
        }
        this.positions = pos.sort();
    };

    checkItem = (c, f) => {
        let yT = this.positions[0];
        for (let i = 0; i < c.length; i += 1) {
            const cc = c[i];
            const ccB = cc.baseName.replace("item", "");
            if (ccB === `${f}`) {
                if (f > 5) {
                    yT = this.positions[1];
                }
                if (f > 11) {
                    yT = this.positions[2];
                }
                if (cc.x === this.checkPositions[f] && cc.y >= yT) {
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
        } else {
            this.play();
        }
    }

    onAddItem = (items = false, baseName = "") => {
        if (items && Array.isArray(items)) {
            items = items.concat({
                i: "n" + items.length,
                x: (items.length * 2) % (this.state.cols || 12),
                y: 2, // puts it at the bottom
                w: 2,
                h: this.getHeight(),
                minH: 0.8,
                isResizable: false,
                baseName,
            });
            return items;
        }
    };

    // We're using the cols coming back from this to calculate where to add new items.
    onBreakpointChange(breakpoint, cols) {
        const { img } = this.state;
        this.setState({
            breakpoint: breakpoint,
            cols: cols,
            items: []
        }, () => {
            if (img) {
                this.rerender();
            }
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
        this.setState({ [field]: el }, () => {
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
        const cols = { lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 };
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
                        {!this.state.items.length && !this.state.loader && !this.state.dir ? (
                                <div className="text1 fixedbutton text-31 button font" onClick={this.randomPuzzle}>
                                    🎲 Случайный пазл
                                </div>
                        ) : null}
                        {this.state.win ? (
                                <div className="wrapper">
                                    <div className="modal font">
                                        <h1 className="nt">Поздравляем</h1>
                                        <span className="emoji round">🏆</span>
                                        <h1>Время: {this.state.timeEnd}</h1>
                                        <div className="dir container">
                                            <button className="text1 text-31 button font"
                                                    onClick={this.endGame}>Рестарт
                                            </button>
                                        </div>
                                        <div className="dir container">
                                            <button className="text1 text-31 button font"
                                                    onClick={this.nextGame}>Следующий пазл
                                            </button>
                                        </div>
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
                                    cols={cols}
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

    nextGame = () => {
        window.confetti.stop();
        const { rand } = this.state.img;
        const dir = this.state.dir?.name || this.state.img.dir;
        const add2 = srcs[dir];
        let i = this.state.img.ii + 1;
        if (i === 5) {
            i = 0;
        }
        const img = { src: `${dir}/img${add2[i]}.jpg`, dir, ii: i };
        this.randomPuzzle(null, rand ? { rand: true } : { win: false, img });
    };
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
