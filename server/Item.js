class Item {
    constructor(itemID, name, icon, description, rarity, cost) {
        this.itemID = itemID;
        this.name = name;
        this.icon = icon;
        this.description = description;
        this.rarity = rarity;
        this.cost = cost;
    }
}

module.exports = Item;