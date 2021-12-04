import React from "react";
import WidthProvider  from "../../lib/components/WidthProvider";
import Responsive from "../../lib/ResponsiveReactGridLayout";
import _ from "lodash";
require('./Puzzler/Puzzler').default();
require('./Puzzler/PuzzleGame').default();
const ResponsiveReactGridLayout = WidthProvider(Responsive);
/**
 * This layout demonstrates how to use a grid with a dynamic number of elements.
 */
let getContainerFunc;
export default class AddRemoveLayout extends React.Component {
    static defaultProps = {
        className: "layout",
        cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
        rowHeight: 100
    };

    constructor(props) {
        super(props);
        // const arr = Array.from({length: 10}).fill(1);
        const arr = Array.from({length: 1}).fill(1);
        let items = [];

        this.state = {
            items: items,
            newCounter: items.length,
            containers: {}
        };
        this.refsC = {
        }
        this.onBreakpointChange = this.onBreakpointChange.bind(this);
    }

    componentDidMount() {
        if (Puzzler.support()) {
            console.log(this.refsC);
            var form = document.getElementById('form');
            form.addEventListener('submit', this.onSubmit, false);
        } else {
            document.body.innerHTML = '<h1>Sorry, but you browser doesn\'t support "Canvas". Please, use modern browser such as Firefox, Opera, Safari or Chrome</h1>';
        }
    }
    rerender = (upd = false) => {
        // console.log(getContainerFunc);
        if (getContainerFunc) {
            if (upd) {
                let items = [];
                for (let i = 0; i< 30;i+=1) {
                    items = this.onAddItem(items)
                }
                this.setState({items}, () => {
                    this.canvasDraw();
                })
            } else {
                this.canvasDraw();
            }
        }
    }
    canvasDraw = () => {
        const {containers} = this.state;
        const ww =this.refsC[`testn0`].clientWidth;
        let item1 = 0;
        Object.keys(containers).map(keyItem => {
            const iitem = containers[keyItem]
            const cc = getContainerFunc(iitem.x, iitem.y, iitem.w, iitem.h, true, ww);
            this.refsC[`testn${item1}`].appendChild(cc.container);
            item1 += 1;
        });
    }
    createElement(el) {
        const i = el.i;
        return (
                <div key={i} data-grid={el}>
                    <div ref={eel => this.refsC[`test${i}`] = eel}>
                        <span className="text">{i}</span>
                    </div>
                </div>
        );
    }
    onSubmit = (e) => {
        if (e) {
            e.preventDefault();
        }
        // this.style.display = 'none';
        var url = 'img.jpg';
        var dest = document.createElement('div');
        dest.id = 'dest';
        dest.className = 'dest';
        dest.innerHTML = 'Loading image...';
        document.body.appendChild(dest);
        let items = [];
        for (let i = 0; i< 30;i+=1) {
            items = this.onAddItem(items)
            // this.onAddItem()
        }
        new PuzzleGame(dest, url, false, (images , countY, countX, getContainer, containers) => {
            getContainerFunc = getContainer;
            console.log(getContainerFunc);
            // console.log('test', countY, countX);
            // console.log(containers)
            // console.log(that.refsC.testn0.style?.width)
            this.setState({items, containers}, () => {
                this.rerender();
            });
            const ww =this.refsC[`testn0`].clientWidth;
            // let item1 = 0;
            // Object.keys(containers).map(keyItem => {
            //     const iitem = containers[keyItem]
            //     const cc = getContainer(iitem.x, iitem.y, iitem.w, iitem.h, true, ww);
            //     this.refsC[`testn${item1}`].appendChild(cc.container);
            //     item1 += 1;
            // });
            let item = 0;
            for (var j = 0; j < countY; j++) {
                for (var i = 0; i < countX; i++) {
                    // var container = images[j][i].container;
                    // images[j][i].container.style.width = ww;
                    // const cc = getContainer(j, i, ww, 210, true);
                    // console.log(cc);
                    // this.refsC[`testn${item}`].appendChild(cc.container);
                    // this.refsC[`testn${item}`].appendChild(container);
                    // console.log(this.refsC[`testn${item}`].clientWidth);
                    // container.setAttribute('data-puzzle-x', i);
                    // container.setAttribute('data-puzzle-y', j);
                    item += 1;
                }
            }
            console.log(item);
        });


    }
    //
    onAddItem = (items  = false) => {
        /*eslint no-console: 0*/
        // console.log(this.refsC)
        if (items && Array.isArray(items)) {
            items = items.concat({
                i: "n" + items.length,
                x: (items.length * 2) % (this.state.cols || 12),
                y: Infinity, // puts it at the bottom
                w: 2,
                h: 2
            })
            return items
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
    }

    // We're using the cols coming back from this to calculate where to add new items.
    onBreakpointChange(breakpoint, cols) {
        console.log('tes', cols)
        this.setState({
            breakpoint: breakpoint,
            cols: cols,
            items: [],
        }, () => {
            this.rerender(true)
        });
    }

    onLayoutChange(layout) {
        console.log('tes2')
        this.props.onLayoutChange(layout);
        this.setState({ layout: layout });
    }
    render() {
        console.log(this.props)
        return (
                <div className="center">
                    {this.state.items.length === 0 ? (
                            <button className="btn" onClick={this.onSubmit}>
                                Начать игру
                            </button>
                    ) : null}
                    <ResponsiveReactGridLayout
                            onLayoutChange={this.onLayoutChange}
                            onBreakpointChange={this.onBreakpointChange}
                            {...this.props}
                            cols={{lg: 12, md: 12, sm: 12, xs: 12, xxs: 12}}
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
