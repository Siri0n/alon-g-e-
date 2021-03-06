import Phaser from "phaser";

const wrapListener = (f, self) => {
	f = f.bind(self)
	return function(...args){
		f(this, ...args);
	}
}

class PuzzleGrid extends Phaser.GameObjects.Container{
	constructor(config){
		const {scene, x, y, children} = config;
		super(scene, x, y, children);

		const {cellSize} = config;
		this.s = cellSize;
		this.elementConfig = {};

		this.onClick = wrapListener(this.onClick, this);
	}
	load(data){
		this.removeAll(true);
		for(let elem of data){
			this.createElement(elem);
		}
	}
	createElement({type, ...rest}){
		const element = this.scene.make[type]({
			s: this.s,
			...rest,
			...this.elementConfig
		});
		this.add(element);
		element.on("pointerdown", this.onClick);
		return element;
	}
	async replaceElement(element, newData){
		const {xn, yn} = element;
		await element.disappear({duration: 250, destroy: true});
		const newElement = this.createElement({xn, yn, invisible: true, ...newData});
		await newElement.appear({duration: 250});
	}
	doWhere(criteria, action){
		return Promise.all(
			this.getAll()
				.filter(criteria)
				.map(action)
		);
	}
	disableWhere(criteria){
		this.doWhere(criteria, it => it.disable());
	}
	enableAll(){
		this.getAll().forEach(it => it.enable());
	}
	checkWin(){
		return !this.getAll().some(it => it.type == 'heart');
	}
	onClick(target){
		this.emit("click", target);
	}
}

export default PuzzleGrid;