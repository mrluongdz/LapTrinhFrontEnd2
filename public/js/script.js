// hàm tạo item
function Item(name, type) {
	this.name = name;
	this.id = genId();
	this.type = type;
}
Item.prototype.getName = function () {
	return this.name;
};
// Hàm tạo hạt giống
/*state:loại,
invImg:ảnh khi gieo hạt
growthImg0:ảnh khi cây lớn
ripeImg:ảnh cây khi thu hoạch đc
buyPrice:giá mua;
sellPrice:giá bán;
durationGrowth0:thời gian phat trien
durationGrowth1:thời gian sẽ thu hoạch
quantity:số lượng
*/
function Seed(parms) {
	Item.call(this, parms.name, parms.type);
	this.state = "seed";
	this.invImg = parms.invImg;
	this.growthImg0 = parms.growthImg0;
	this.growthImg1 = parms.growthImg1;
	this.ripeImg = parms.ripeImg;
	this.buyPrice = parms.buyPrice;
	this.sellPrice = parms.sellPrice;
	this.timePlanted = null;
	this.durationGrowth0 = parms.durationGrowth0;
	this.durationGrowth1 = parms.durationGrowth1;
	this.quantity = 1;
}
Seed.prototype = new Item();
Seed.prototype.constructor = Seed;
Seed.prototype.clone = function () {
	let seedData = {
		name: this.name,
		type: this.type,
		state: this.state,
		invImg: this.invImg,
		growthImg0: this.growthImg0,
		growthImg1: this.growthImg1,
		ripeImg: this.ripeImg,
		buyPrice: this.buyPrice,
		sellPrice: this.sellPrice,
		timePlanted: this.timePlanted,
		durationGrowth0: this.durationGrowth0,
		durationGrowth1: this.durationGrowth1,
		quantity: this.quantity,
	};

	return new Seed(seedData);
};
//hàm thay đổi ảnh cho cây:hạt giống,lớn lên và thu hoạch;
Seed.prototype.currentImage = function () {
	switch (this.state) {
		case "ripe":
			return this.ripeImg;
		case "sprout":
			return this.growthImg0;
		default:
			return this.invImg;
	}
};
//Hàm tính thời gian từ khi gieo mầm tới khi thu hoạch
Seed.prototype.growthPeriod = function () {
	let total = this.durationGrowth0 + this.durationGrowth1;
	total += " phút";
	return total;
};
//Hàm tạo tên hạt giống khi gieo
Seed.prototype.getName = function () {
	if (this.type === "seed") {
		switch (this.state) {
			case "seed":
				return this.name;
			case "sprout":
				return this.name;
		}
	}

	return this.name;
};
//hàm tính thời gian sẽ thu hoạch
Seed.prototype.timeUntilRipe = function () {
	let now = new Date().getTime();
	let ripeTime =
		this.timePlanted.getTime() +
		(this.durationGrowth0 + this.durationGrowth1) * 60000;
	if (now < ripeTime) {
		let secs = (ripeTime - now) / 1000;
		if (secs < 60) {
			return Math.trunc(secs) + " Giây";
		} else {
			if (secs < 2) {
				return Math.trunc(secs / 60) + " phút";
			} else {
				return Math.trunc(secs / 60) + " phút";
			}
		}
	} else {
		return "0 giây";
	}
};

// Tạo id
function genId() {
	return Math.random().toString(36).substring(2);
}

function dragstartHandler(ev) {
	ev.dataTransfer.setData("text/plain", ev.target.id);
	ev.dataTransfer.dropEffect = "move";
	view.disableTooltip(ev.target.parentNode.parentNode);
}

function dragoverHandler(ev) {
	ev.preventDefault();
	ev.dataTransfer.dropEffect = "move";
}

function marketDropHandler(ev) {
	let itemId = ev.dataTransfer.getData("text/plain");

	if (ev.target instanceof HTMLTableCellElement) {
		cellId = ev.target.id;
	} else {
		cellId = ev.target.parentNode.id;
	}
	controller.dropOnMarket(cellId, itemId);
}

function fieldDropHandler(ev) {
	ev.preventDefault();
	let itemId = ev.dataTransfer.getData("text/plain");

	if (ev.target instanceof HTMLTableCellElement) {
		cellId = ev.target.id;
	} else {
		cellId = ev.target.parentNode.id;
	}

	controller.dropOnPlot(cellId, itemId);
}

function supplySelectionHandler(ev) {
	if (view.isSelected(this)) {
		view.deselect(this);
	} else {
		view.select(this);
	}
}

function buyButtonHandler() {
	if (model.supSelectCellId) {
		model.buySupItem();
	}
}

function appendMultilineText(parent, strings) {
	for (i = 0; i < strings.length; i++) {
		parent.appendChild(document.createTextNode(strings[i]));
		if (i < strings.length - 1) {
			parent.appendChild(document.createElement("br"));
		}
	}
}

let model = {
	gold: 30,
	inv: new Array(10),
	field: new Array(32),
	seeds: initSeeds(),
	supplies: new Array(10),
	supSelectCellId: undefined,

	initField: function () {
		let nothing = {
			name: "nothing",
		};
		for (i = 0; i < this.field.length; i++) {
			this.field[i] = nothing;
		}

		view.updateField(this.field);
	},

	fieldGetItemById: function (id) {
		for (let i = 0; i < this.field.length; i++) {
			if (this.field[i].id === id) {
				return this.field[i];
			}
		}
	},

	// Hàm Xóa
	fieldRemove: function (id) {
		for (let i = 0; i < this.field.length; i++) {
			if (this.field[i].id === id) {
				this.field[i] = nothing;
				break;
			}
		}
	},

	initInv: function () {
		for (let i = 0; i < this.inv.length; i++) {
			this.inv[i] = nothing;
		}
		this.inv[0] = this.seeds[0].clone();
		this.inv[1] = this.seeds[1].clone();
		view.updateInv(this.inv);
	},

	invGetItemById: function (id) {
		for (let i = 0; i < this.inv.length; i++) {
			if (this.inv[i].id === id) {
				return this.inv[i];
			}
		}
	},

	invGetItemByName: function (name) {
		for (let i = 0; i < this.inv.length; i++) {
			if (this.inv[i].name === name) {
				return this.inv[i];
			}
		}
	},

	invGetTypeById: function (id) {
		for (let i = 0; i < this.inv.length; i++) {
			if (this.inv[i].id === id) {
				return this.inv[i].type;
			}
		}
	},

	invItemNameExists: function (name) {
		for (let i = 0; i < this.inv.length; i++) {
			if (this.inv[i].name === name) {
				return true;
			}
		}

		return false;
	},

	invIsFull: function () {
		for (let i = 0; i < this.inv.length; i++) {
			if (this.inv[i].name === "nothing") {
				return false;
			}
		}

		return true;
	},

	//hàm thêm item
	invAdd: function (item) {
		if (this.invItemNameExists(item.name)) {
			let invItem = this.invGetItemByName(item.name);
			invItem.quantity += 1;
		} else {
			for (let i = 0; i < this.inv.length; i++) {
				if (this.inv[i].name === "nothing") {
					this.inv[i] = item.clone();
					break;
				}
			}
		}
	},

	// hàm xóa số lượng item
	invRemove: function (id) {
		for (let i = 0; i < this.inv.length; i++) {
			if (this.inv[i].id === id) {
				if (this.inv[i].quantity > 1) {
					this.inv[i].quantity -= 1;
				} else {
					this.inv[i] = nothing;
				}
				break;
			}
		}
	},

	initSupplies: function () {
		for (let i = 0; i < this.supplies.length; i++) {
			this.supplies[i] = nothing;
		}
		this.supplies[0] = this.seeds[0].clone();
		this.supplies[1] = this.seeds[1].clone();
		this.supplies[2] = this.seeds[2].clone();
		this.supplies[3] = this.seeds[3].clone();
		view.updateSupplies(this.supplies);
	},

	supGetItemById: function (id) {
		for (let i = 0; i < this.supplies.length; i++) {
			if (this.supplies[i].id === id) {
				return this.supplies[i];
			}
		}
	},

	getItemById: function (id) {
		let item = this.invGetItemById(id);
		if (!item) {
			item = this.fieldGetItemById(id);
		}

		return item;
	},

	// hàm xử lý vàng
	buySupItem: function () {
		let item = this.supGetItemById(
			document.getElementById(model.supSelectCellId).firstChild.firstChild.id
		);

		if (
			(!this.invIsFull() || this.invItemNameExists(item.name)) &&
			this.gold >= item.buyPrice
		) {
			this.gold -= item.buyPrice;
			this.invAdd(item);
			view.updateInv(this.inv);
			view.displayGold(this.gold);
		}
	},

	// Hàm trông cây

	plantSeed: function (plotId, seedId) {
		let i = plotId.replace("field", "");

		this.field[i] = this.invGetItemById(seedId);
		this.field[i].timePlanted = new Date();
		this.field[i].state = "planted";
		view.updateField(this.field);

		this.invRemove(seedId);
		view.updateInv(this.inv);
	},

	// Hàm tính thời gian
	monitorField: function () {
		let now = new Date().getTime();
		for (let i = 0; i < this.field.length; i++) {
			let plot = this.field[i];
			if (plot.name !== "nothing") {
				growth0 = plot.timePlanted.getTime() + plot.durationGrowth0 * 60000;
				growth1 = growth0 + plot.durationGrowth1 * 60000;

				if (now > growth0) {
					if (plot.state === "planted") {
						plot.state = "sprout";
					} else if (plot.state === "sprout" && now > growth1) {
						plot.state = "ripe";
					}
				}
			}
		}

		view.updateField(this.field);
	},
//hàm bán item :nếu là loại thu hoạch thì giá = giá thu hoạch,nếu là hạt giống thì số tiền bán bằng tiền mua;
	sellItem: function (item) {
		if (item.type === "seed") {
			if (item.state === "ripe") {
				this.gold += item.sellPrice;
			} else {
				this.gold += item.buyPrice;
			}
		}

		view.displayGold(this.gold);

		if (this.invGetItemById(item.id)) {
			this.invRemove(item.id);
			view.updateInv(this.inv);
		} else {
			this.fieldRemove(item.id);

			view.updateField(this.field);
		}
	},
};

let view = {
	//Hàm trồng cây
	updateField: function (field) {
		for (let i = 0; i < field.length; i++) {
			let cell = document.getElementById("field" + i);
			this.removeChildren(cell);

			if (field[i].name === "nothing") {
				cell.ondragover = dragoverHandler;
				cell.ondrop = fieldDropHandler;
				continue;
			}

			cell.ondragover = null;
			cell.ondrop = null;

			let div = document.createElement("div");
			div.setAttribute("id", "fieldDiv" + i);
			div.setAttribute("class", "fieldItemDiv");

			let img = document.createElement("img");
			if (field[i].state === "planted") {
				img.setAttribute("src", "public/image/dirt_seeded.png");
			} else {
				img.setAttribute("src", "public/image/" + field[i].currentImage());
			}
			img.setAttribute("id", field[i].id);
			img.ondragstart = dragstartHandler;
			div.appendChild(img);

			let span = document.createElement("span");
			span.setAttribute("class", "fieldTooltip");
			let txt = [field[i].getName()];
			if (field[i].state !== "ripe") {
				txt.push("Có thể thu hoạch sau " + field[i].timeUntilRipe());
			} else {
				txt.push("Có thể thu hoạch!");
				txt.push("Giá Bán: " + field[i].sellPrice + "$");
			}
			appendMultilineText(span, txt);
			div.appendChild(span);

			cell.appendChild(div);
		}
	},

	//Cập nhập hạt giống
	updateInv: function (inv) {
		for (let i = 0; i < inv.length; i++) {
			let cell = document.getElementById("inv" + i);
			this.removeChildren(cell);

			if (inv[i].name === "nothing") {
				continue;
			}

			let div = document.createElement("div");
			div.setAttribute("id", "invDiv" + i);
			div.setAttribute("class", "invItemDiv");

			let img = document.createElement("img");
			img.setAttribute("src", "public/image/" + inv[i].invImg);
			img.setAttribute("id", inv[i].id);
			img.ondragstart = dragstartHandler;
			div.appendChild(img);

			let span = document.createElement("span");
			span.setAttribute("class", "invTooltip");
			let txt = [inv[i].getName()];
			txt.push("Giá Mua: " + inv[i].buyPrice + "$");
			txt.push("Giá Bán: " + inv[i].sellPrice + "$");
			txt.push("Thời Gian Thu Hoạch: " + inv[i].growthPeriod());
			txt.push("Số Lượng: " + inv[i].quantity);
			appendMultilineText(span, txt);
			div.appendChild(span);

			cell.appendChild(div);
		}
	},

	updateSupplies: function (supplies) {
		for (let i = 0; i < supplies.length; i++) {
			let cell = document.getElementById("sup" + i);
			this.removeChildren(cell);

			if (supplies[i].name === "nothing") {
				continue;
			}

			cell.onclick = supplySelectionHandler;

			//tao hinh anh giống cây
			let div = document.createElement("div");
			div.setAttribute("id", "supDiv" + i);
			div.setAttribute("class", "supplyItemDiv");

			let img = document.createElement("img");
			img.setAttribute("src", "public/image/" + supplies[i].invImg);
			img.setAttribute("id", supplies[i].id);
			img.setAttribute("draggable", "false");
			div.appendChild(img);

			let span = document.createElement("span");
			span.setAttribute("class", "supTooltip");
			let txt = [supplies[i].getName()];
			txt.push("Giá Mua: " + supplies[i].buyPrice + "$");
			txt.push("Giá Bán: " + supplies[i].sellPrice + "$");
			txt.push("Thời Gian Thu Hoạch: " + supplies[i].growthPeriod());
			appendMultilineText(span, txt);
			div.appendChild(span);

			cell.appendChild(div);
		}
	},

	isSelected: function (cell) {
		if (cell.id === model.supSelectCellId) {
			return true;
		}

		return false;
	},

	//Hàm chọn 
	select: function (cell) {
		let table = cell.parentElement.parentElement.parentElement;

		if (table.id === "supplies" && model.supSelectCellId) {
			this.deselect(document.getElementById(model.supSelectCellId));
		}

		div = document.createElement("div");
		div.setAttribute("id", "selected");
		div.setAttribute("class", "selected");

	
		cell.firstChild.appendChild(div);

		if (cell.id.startsWith("sup")) {
			model.supSelectCellId = cell.id;
		}
	},

	//bỏ chọn 1 ô
	deselect: function (cell) {
		if (cell.id.startsWith("sup")) {
			model.supSelectCellId = undefined;
			this.updateSupplies(model.supplies);
		}
	},

	//xóa phần tử
	removeChildren: function (parent) {
		while (parent.firstChild) {
			parent.removeChild(parent.firstChild);
		}
	},

	displayGold: function (gp) {
		let txtBox = document.getElementById("goldAmt");
		txtBox.innerHTML = gp;
	},

	initMarket: function () {
		let cell = document.getElementById("market");
		cell.ondragover = dragoverHandler;
		cell.ondrop = marketDropHandler;
	},

	disableTooltip: function (cell) {
		let span = cell.firstChild.children[1];
		span.setAttribute("style", "visibility: hidden;");
	},
};

let controller = {
	dropOnMarket: function (cellId, itemId) {
		let item = model.getItemById(itemId);

		if (
			item.type === "seed" &&
			(item.state === "ripe" || item.state === "seed")
		) {
			model.sellItem(item);
		}
	},

	//kéo thả
	dropOnPlot: function (plotId, id) {
		
		let item = model.getItemById(id);
		if (item.type === "seed") {
			model.plantSeed(plotId, id);
		}
	},
};

//khởi tạo đối tượng trống
let nothing = {
	name: "nothing",
	id: "0",
};

//khởi tạo mảng hạt giống
function initSeeds() {
	let seeds = [];

	let seedData = {
		name: "Lúa",
		type: "seed",
		invImg: "seed_master.png",
		growthImg0: "sprout.png",
		ripeImg: "wheat_ripe.png",
		durationGrowth0: 1,
		durationGrowth1: 1,
		buyPrice: 1,
		sellPrice: 2,
	};
	//thêm item vào mảng data item
	seeds.push(new Seed(seedData));

	seedData = {
		name: "Cà rốt",
		type: "seed",
		invImg: "seed_master.png",
		growthImg0: "sprout.png",
		ripeImg: "carrot_ripe.png",
		durationGrowth0: 1,
		durationGrowth1: 2,
		buyPrice: 5,
		sellPrice: 10,
	};
	seeds.push(new Seed(seedData));

	seedData = {
		name: "Berries",
		type: "seed",
		invImg: "seed_master.png",
		growthImg0: "sprout.png",
		ripeImg: "berries_ripe.png",
		durationGrowth0: 2,
		durationGrowth1: 1,
		buyPrice: 15,
		sellPrice: 30,
	};
	seeds.push(new Seed(seedData));

	seedData = {
		name: "Garlic",
		type: "seed",
		invImg: "seed_master.png",
		growthImg0: "sprout.png",
		ripeImg: "garlic_ripe.png",
		durationGrowth0: 3,
		durationGrowth1: 1,
		buyPrice: 30,
		sellPrice: 100,
	};
	seeds.push(new Seed(seedData));

	return seeds;
}

function init() {
	model.initInv();
	model.initSupplies();
	view.displayGold(model.gold);
	view.initMarket();
	model.initField();

	let b = document.getElementById("buyButton");
	b.onclick = buyButtonHandler;

	setInterval(function () {
		model.monitorField();
	}, 1000);
}

window.onload = init;
