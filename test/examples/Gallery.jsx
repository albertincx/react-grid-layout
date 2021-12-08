import React from "react";
import _ from "lodash";

const namesRUS = ["Мультики", "Животные", "Цветы"];
const names = [
    "cartoon",
    "animal",
    "flowers"
];
export const srcs = {
    cartoon: [1, 2, 3, 4, 5],
    animal: [1, 2, 3],
    flowers: [1, 2]
};

export default class Gallery extends React.Component {
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
            containers: [],
            loader: false
        };
        this.refsC = {};
    }

    componentDidMount() {
        this.createItems();
    }

    createItems = () => {
        let items = [];
        for (let i = 0; i < 3; i += 1) {
            items = this.onAddItem(items, true, i);
        }
        this.setState({ items });
    };

    componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>) {
        if (this.props.dir !== prevProps.dir) {
            if (this.props.dir) {
                let items = [];
                for (let i = 0; i < srcs[this.props.dir.name].length; i += 1) {
                    items = this.onAddItem(items, false, i);
                }
                this.setState({ items });
            } else {
                this.createItems();
            }
            return;
        }
        if (!this.state.items.length) {
            this.createItems();
        }
    }

    createElement(el) {
        const i = el.i;
        return (
                <div key={i} data-grid={el}>
                    <div ref={eel => this.refsC[`test${i}`] = eel} onClick={e => {
                        this.props.onSelect(el);
                    }}>
                        <div className="dir container">
                            {el.src ? (
                                    <div className="img">
                                        <img src={el.src} alt="" />
                                    </div>
                            ) : (
                                    <>
                                        <div className="text1 text-31 button font">{namesRUS[el.ii]}</div>
                                    </>
                            )}
                        </div>
                    </div>
                </div>
        );
    }

    onAddItem = (items = false, dir = false, i) => {
        /*eslint no-console: 0*/
        if (items && Array.isArray(items)) {
            items = items.concat({
                ii: i,
                i: "n" + items.length,
                x: (items.length * 2) % (this.state.cols || 12),
                y: Infinity, // puts it at the bottom
                w: 2,
                minH: 0.8,
                isResizable: false,
                src: dir ? false : `${this.props.dir.name}/img${i + 1}.jpg`,
                name: names[i]
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

    render() {
        if (this.props.img) {
            return false;
        }
        return (
                <div className="center2">
                    {!this.props.dir ? (
                            <div className="text text-3 font title">
                                Категории пазлов
                                <span className="version">версия 0.12</span>
                            </div>
                    ) : null}
                    <div className={`game ${this.props.dir ? " even" : ""}`}>
                        {_.map(this.state.items, el => this.createElement(el))}
                    </div>
                </div>
        );
    }
}
