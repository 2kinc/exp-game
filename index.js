(function (global, w, h, el) {
    NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
    HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

    if (!window.localStorage) {
        throw "Your browser does not support Local Storage";
    }

    //firebase stuff
    var config = {
        apiKey: "AIzaSyADD6YWKrzibRMwJNi1FwUR0jcR0GitZPI",
        authDomain: "k-inc-232222.firebaseapp.com",
        databaseURL: "https://k-inc-232222.firebaseio.com",
        projectId: "k-inc-232222",
        storageBucket: "",
        messagingSenderId: "827804821456"
    };
    var app = firebase.initializeApp(config);
    var database = app.database();
    var databaseref = database.ref().child('exp');
    var auth = app.auth();

    function Coordinate(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    var getMapTileKey = function (tile) {
        return String(tile.coordinates.x) + "," + String(tile.coordinates.y);
    };


    function GameSave() {
        this.playerName = "Player 1";
        this.energy = 15;
        this.maxEnergy = 15;
        this.hp = 10;
        this.maxhp = 10;
        this.inventory = new GameObject.prototype.Inventory(150);
    }

    var qs = function (selector) {
        return document.querySelector(selector);
    };

    function Directions() { }
    Directions.prototype.up = () => {
        return 0
    };
    Directions.prototype.right = () => {
        return 1
    };
    Directions.prototype.down = () => {
        return 2
    };
    Directions.prototype.left = () => {
        return 3
    };

    function MapTile(coords, loot, terrain) {
        this.coordinates = coords;
        this.loot = loot;
        this.terrain = terrain;
    };

    function Tile(display_text, color, name, description, properties) {
        this.display_text = display_text;
        this.color = color;
        this.name = name;
        this.description = description;
        this.properties = properties || null;
        this.itemDrop = new GameObject.prototype.Item(name, 1);
        if (properties != null && properties.itemDrop != undefined) {
            this.itemDrop = this.properties.itemDrop;
        }
    };

    function Chunk(game, sideLength, bottomleft) {
        this.terrain = new Map();
        this.bottomleft = bottomleft;
        this.sideLength = sideLength;
        for (var x = bottomleft.x; x < sideLength + bottomleft.x; x++) {
            for (var y = bottomleft.y; y < sideLength + bottomleft.y; y++) {
                var value = noise.simplex2(x / 100, y / 100);
                var _ = game.getMapTile(new Coordinate(x, y));
                var newTile;
                if (_) {
                    value = _;
                    newTile = new MapTile({
                        x: x,
                        y: y
                    }, null, value);
                }
                else {
                    if (value < 0) {
                        value = 1 + value;
                    }
                    if (value >= 0.75) {
                        value = game.tileValues.water;
                    } else if (value >= 0.45) {
                        value = game.tileValues.sand;
                    } else if (value >= 0.25) {
                        value = game.tileValues.grass;
                    } else if (value >= 0) {
                        value = game.tileValues.dirt;
                    }
                    newTile = new MapTile({
                        x: x,
                        y: y
                    }, null, value);
                    var a = newTile.coordinates.x;
                    if (a < 0) {
                        a = pi.length + a;
                    }
                    var b = newTile.coordinates.y;
                    if (b < 0) {
                        b = pi.length + b;
                    }
                    var k = ((pi[a % (pi.length - 1)] + pi[b % (pi.length - 1)] + pi[Math.abs(a + b) % (pi.length - 1)] + pi[Math.abs(a - b)] % (pi.length - 1)) / 4);
                    if (k < 2 && newTile.terrain.name == 'Sand') {
                        newTile.terrain = global.GameObject.tileValues.cactus;
                        value = global.GameObject.tileValues.cactus;
                    }
                    if (k < 4 && newTile.terrain.name == 'Dirt') {
                        newTile.terrain = global.GameObject.tileValues.tree;
                        value = global.GameObject.tileValues.tree;
                    }
                    game.setMapTileWithoutUpdate(Object.assign(value, {
                        coordinates: {
                            x: x, y: y
                        }
                    }));
                }
                if (newTile.coordinates.x == game.coordinate.x && newTile.coordinates.y == game.coordinate.y) {
                    newTile.loot = new game.lootSpawn(false);
                }
                this.terrain.set(getMapTileKey({
                    coordinates: new Coordinate(x, y)
                }), newTile);

            }
        }
    };


    function GameObject() {
        var that = this;
        var energy = 15;
        noise.seed(Math.random());
        this.coordinates = new Coordinate;
        this.facing = (new Directions).up();
        this.hp = 10;
        this.maxhp = 10;
        this.getEnergy = () => energy;
        this.setEnergy = function (a) {
            energy = a;
        };
        this.maxEnergy = 15;
        this.name = 'Default Noob';
        this.lootArray = [];
        this.fightingMode = false;
        this.saveBoxHTML;
        this.playerFightingOrigin;
        this.enemyhp = this.enemyMaxhp;
        this.playerIsShooting = false;
        this.enemyDecisionInterval;
        this.gameProgression = 0;
        this.regenDegenInterval;
        this.isTown = false;
        this.armour = false;
        this.generatedMap;
        this.inventory = new this.Inventory(150);
        this.elements = {
            player: qs('#player'),
            box: qs('#box'),
            enemy: qs('#enemy'),
            enemyhp: qs('#enemy-hp'),
            lootHeading: qs('#loot-heading'),
            play: qs("#play_button"),
            food: qs('#food'),
            loot: qs('#loot'),
            name: qs('#name'),
            ammo: qs('#ammo'),
            hp: qs('#hp'),
            energy: qs('#energy'),
            ammoTakes: qs('#ammotakes'),
            foodTakes: qs('#foodtakes'),
            lootAmmo: qs('#lootammonum'),
            lootFood: qs('#lootfoodnum'),
            lootArmour: qs('#lootarmournum'),
            lootAmmoWrap: qs('#lootammo'),
            lootFoodWrap: qs('#lootfood'),
            lootArmourWrap: qs('#lootarmour'),
            play: qs('#play_button'),
            name: qs('#name'),
            tooltip: qs('#tooltip'),
            tooltipTitle: qs('#tooltip-title'),
            tooltipText: qs('#tooltip-text'),
            optionsButton: qs('#options-button'),
            optionsModal: qs('#options-modal'),
            effectsButton: qs('#effects-button'),
            inventorySlots: qs('#inventory-slots'),
            inventoryScrollLeft: qs('#inv-scroll-left'),
            inventoryScrollRight: qs('#inv-scroll-right'),
            dialogueContainer: $('#dialogue'),
            dialogue: $('#dialogue-text'),
            dialogueCharacter: $('#dialogue-character'),
            encounterBox: $('#encounter-box'),
            encounterPlayer: $('#encounter-player')
        };

        this.itemValues = {
            ammo: new this.Item('⚫', 'ffffff', 'Ammo', 'Small pellets used to power your gun.'),
            dirt: new this.Item('*', '6d4c41', 'Dirt', 'An abundant substance that plants grow in.'),
            wood: new this.Item('🏽', '826054', 'Wood', 'Strong organic material used to build structures.'),
            armour: new this.Item('🛡️', 'ffffff', 'Armour', 'Shields your vulnerable soul from attackers. Could also be spelled "armor".'),
            potato: new this.Item('🥔', 'ffffff', 'Potato', 'A good but not very tasty source of food.', {
                energy: 2
            }),
            tomato: new this.Item('🍅', 'ffffff', 'Tomato', 'A juicy tomato that will please your appetite.', {
                energy: 2
            }),
            grapes: new this.Item('🍇', 'ffffff', 'Grapes', 'A hearty bunch of grapes.', {
                energy: 3
            }),
            meat: new this.Item('🍖', 'ffffff', 'Meat', 'A good and non-vegetarian way to fill your stomach.', {
                energy: 4
            }),
            pie: new this.Item('🥧', 'ffffff', 'Pie', 'A good, fat apple pie. Probably a few months old.', {
                energy: 7
            }),
            orange: new this.Item('🍊', 'ffffff', 'Orange', 'A small, orange fruit you can fit in your hand.', {
                energy: 3
            })
        };

        this.tileValues = {
            empty: new Tile(' ', '#000000', 'Empty', 'An empty tile.', {
                unbreakable: true
            }),
            water: new Tile('.', '#03a9f4', 'Water', 'Two H and one O fused into one character.', {
                unbreakable: true
            }),
            dirt: new Tile('*', '#6d4c41', 'Dirt', 'An abundant substance that plants grow in.'),
            sand: new Tile('~', '#fdd835', 'Sand', 'Tiny bits of shredded text make up sand.'),
            grass: new Tile(',', '#4caf50', 'Grass', 'Created when artificial life met dirt.', {
                itemDrop: this.itemValues.dirt
            }),
            cactus: new Tile('🌵', '#fdd835', 'Cactus', 'A prickly plant that is tough enough to survive in the harsh desert.', {
                damage: 1
            }),
            tree: new Tile('🌲', '#6d4c41', 'Tree', 'A tall plant with a thick trunk.', {
                itemDrop: this.itemValues.wood
            }),
            wood: new Tile('🏽', '#826054', 'Wood', 'Strong organic material used to build structures.'),
            spaghetti: new Tile('🍝', '#000000', 'Spaghetti', 'A steaming plate of spaghetti, just lying around.')
        };

        this.Face = function (text, color) {
            this.text = text;
            this.color = color || null;
        }

        this.Character = function (name, faces, color) {
            this.name = name;
            this.faces = faces;
            this.color = color || '#00c853';
        }

        this.characters = {
            ctrlz: new that.Character('Ctrl + Z', {
                default: new that.Face('o-(╭ರ_⊙)-o'),
                happy: new that.Face('o-(✦‿✦)-o'),
                mad: new that.Face('O-(>⌒<)-O💢', '#ff0000')
            }),
            curry: new that.Character('AutoCurry', {
                default: new that.Face('<◔⎁◔>'),
                happy: new that.Face('<♥⎁♥>🍛'),
                mad: new that.Face('>ఠ⎁ఠ<🔥')
            })
        }

        this.coordinate = {
            x: 0,
            y: 0
        };

        var worldModifications = new Map();

        this.setMapTile = function (tile) {
            worldModifications.set(getMapTileKey(tile), tile);
            var a = new Chunk(this, 25, {
                x: this.get_bottomleft().x,
                y: this.get_bottomleft().y
            });
            this.renderChunks([a]);
        };

        this.setMapTileWithoutUpdate = function (tile) {
            worldModifications.set(getMapTileKey(tile), tile);
        };

        this.getMapTile = function (coordinates) {
            return worldModifications.get(getMapTileKey({ coordinates: coordinates }));
        };

        this.getTileElement = function (x, y) {
            return document.querySelector('#c_' + this.for_id(x) + '_' + this.for_id(y));
        };

        var that = this;
        this.renderChunks = function (chunks) {
            chunks.forEach(function (chunk) {
                for (var x = chunk.bottomleft.x; x < chunk.bottomleft.x + chunk.sideLength; x++) {
                    for (var y = chunk.bottomleft.y; y < chunk.bottomleft.y + chunk.sideLength; y++) {
                        var tile = that.getTileElement(x, y);
                        var k = chunk.terrain.get(getMapTileKey({
                            coordinates: {
                                x: x,
                                y: y
                            }
                        })).terrain;
                        if (k) {
                            tile.innerHTML = k.display_text;
                        }
                        else {
                            tile.innerHTML = "-NTI-";
                        }
                        tile.style.background = k.color + '66';
                        tile.style.border = 'none';
                        tile.setAttribute('tooltip-title', '[' + k.display_text + '] ' + k.name);
                        tile.setAttribute('tooltip-text', k.description);

                        var tr = chunk.terrain.get(getMapTileKey({
                            coordinates: {
                                x: x + 1,
                                y: y
                            }
                        }));
                        if (tr && tr.terrain && k.name != tr.terrain.name) {
                            tile.style.borderRight = '2px #ffffffaa solid';
                            tile.style.paddingRight = '-2px';
                        }

                        var tt = chunk.terrain.get(getMapTileKey({
                            coordinates: {
                                x: x,
                                y: y + 1
                            }
                        }));
                        if (tt && tt.terrain && k.name != tt.terrain.name) {
                            tile.style.borderTop = '2px #ffffffaa solid';
                            tile.style.paddingTop = '-2px';
                        }
                    }
                }
            });
            qs('td.current').innerText = '@';
        };

        this.get_topleft = function () {
            return {
                y: this.coordinate.y + Math.floor(h / 2),
                x: this.coordinate.x - Math.floor(w / 2)
            }
        };
        this.get_bottomleft = function () {
            return {
                x: this.coordinate.x - Math.floor(w / 2),
                y: this.coordinate.y - Math.floor(h / 2)
            }
        };
        this.get_topright = function () {
            return {
                x: this.coordinate.x + Math.floor(w / 2),
                y: this.coordinate.y + Math.floor(h / 2)
            }
        };
        this.get_bottomright = function () {
            return {
                x: this.coordinate.x + Math.floor(w / 2),
                y: this.coordinate.y - Math.floor(h / 2)
            }
        };
        this.for_id = function (n) {
            return String(Math.abs(n)) + (n < 0 ? "n" : "");
        };
        this.get_tile_id = function (sx, sy) {
            return "c_" + sx + "_" + sy;
        };
        this.updateCenterEl = function () {
            var c = document.querySelector("td.current");
            if (c) {
                c.classList.remove("current");
            }
            c = document.getElementById(this.get_tile_id(this.for_id(this.coordinate.x), this.for_id(this.coordinate.y)));
            if (c) {
                c.classList.add("current");
            }
        };
        this.generate_rows = function (topleft, n_rows, n_cols, start_index) {
            var anchor = null;
            if (start_index >= 0) {
                anchor = el.children[start_index];
            }
            if (start_index < 0) {
                anchor = el.children[el.children.length + start_index];
            }
            for (var y = 0; y < n_rows; y++) {
                var tr = document.createElement("tr");
                var sy = this.for_id(topleft.y - y);
                tr.id = "r_" + sy;
                for (var x = 0; x < n_cols; x++) {
                    var td = document.createElement("td");
                    var sx = this.for_id(topleft.x + x);
                    td.id = this.get_tile_id(sx, sy);
                    td.innerText = String(topleft.x + x) + "," + String(topleft.y - y);
                    //td.style.background = "rgb(" + Math.abs(topleft.x + x) * 8 % 256 + ',' + Math.abs(topleft.y - y) * 8 % 256 + ', 0)';
                    tr.appendChild(td);
                }
                if (anchor) {
                    el.insertBefore(tr, anchor);
                } else {
                    el.appendChild(tr);
                }
            }
            this.updateCenterEl();
        };
        this.generate_columns = function (topleft, n_rows, n_cols, start_index) {
            for (var x = 0; x < n_cols; x++) {
                var sx = this.for_id(topleft.x + x);
                var sy = this.for_id(topleft.y);
                for (var y = 0; y < n_rows; y++) {
                    var td = document.createElement("td");
                    var rows = el.children;
                    sy = this.for_id(topleft.y - y);
                    td.id = this.get_tile_id(sx, sy);
                    td.innerText = String(topleft.x + x) + "," + String(topleft.y - y);
                    //td.style.background = "rgb(" + Math.abs(topleft.x + x) * 8 % 256 + ',' + Math.abs(topleft.y - y) * 8 % 256 + ', 0)';
                    rows[y].insertBefore(td, rows[y].children[start_index]);
                }
            }
            this.updateCenterEl();
        }

        this.initialize_viewport = function () {
            var topleft = this.get_topleft();
            this.generate_rows(topleft, h, w);
            var skips = 0;
            document.onkeyup = function (event) {
                if (document.activeElement != that.elements.name) {
                    var d = new Directions();
                    var key = event.key.toLowerCase();
                    if (key === "w") {
                        that.shift_viewport_vertically(1);
                        that.facing = d.up();
                        that.elements.player.style.transform = 'rotate(0deg)';
                        global.GameObject.gameProgression++;
                    } else if (key === "s") {
                        that.shift_viewport_vertically(-1);
                        that.facing = d.down();
                        that.elements.player.style.transform = 'rotate(180deg)';
                        global.GameObject.gameProgression++;
                    } else if (key === "d") {
                        that.shift_viewport_horizontally(1);
                        that.facing = d.right();
                        that.elements.player.style.transform = 'rotate(90deg)';
                        global.GameObject.gameProgression++;
                    } else if (key === "a") {
                        that.shift_viewport_horizontally(-1);
                        that.facing = d.left();
                        that.elements.player.style.transform = 'rotate(270deg)';
                        global.GameObject.gadameProgression++;
                    } else if (key === "q") {
                        if (that.getMapTile(that.coordinate).properties.unbreakable != true) {
                            var emptyTile = Object.assign({}, that.tileValues.empty);
                            emptyTile.coordinates = Object.assign({}, that.coordinate);
                            that.setMapTile(emptyTile);
                        }
                    } else if (key === "e" && document.activeElement != qs('#test-place-tile')) {
                        var value = qs('#test-place-tile').value;
                        if (that.tileValues[value]) {
                            var newTile = Object.assign({}, that.tileValues[value]);
                            newTile.coordinates = Object.assign({}, that.coordinate);
                            that.setMapTile(newTile);
                        }
                    } else if (key === " ") {
                        $('body').css({
                            '--dialogue-display': 'none'
                        });
                        $('#dialogue-continue').removeClass('active');
                        clearInterval(global.GameObject.dialogueInterval);
                    } else if (key === "z") {
                        $('body').css({
                            cursor: 'pointer'
                        });
                    } else if (key === "x") {
                        $('body').css({
                            cursor: 'grab'
                        });
                    } else if (key === "c") {
                        $('body').css({
                            cursor: 'text'
                        });
                    } else if (key === "enter") {
                        $('span.take-loot')[0].click();
                    }
                }
                if (event.key === '$') {
                    global.GameObject.displayDialogue('Salutations buddy! My name is Ctrl + Z. You just pressed the "' + event.key + '" key!', 'character:ctrlz:default');
                    if (skips > 9)
                        global.GameObject.displayDialogue('Hey, you better stop skipping my dialogue. It is not funny.', 'character:ctrlz:mad');
                    skips++;
                }
            };
            document.onkeydown = function (e) {
                if (e.key === " ") {
                    $('#dialogue-continue').addClass('active');
                } else if (e.key === "Enter") {
                    $('span.take-loot')[0].classList.add('active');
                }
            };
            $('#dialogue-continue').click(function () {
                $('body').css({
                    '--dialogue-display': 'none'
                });
                $('#dialogue-continue').removeClass('active');
                clearInterval(global.GameObject.dialogueInterval);
            });
            var a = new Chunk(this, 25, {
                x: this.get_bottomleft().x,
                y: this.get_bottomleft().y
            });
            this.renderChunks([a]);
            this.elements.player.style.left = qs('td.current').getBoundingClientRect().left + 'px';
            this.elements.player.style.top = qs('td.current').getBoundingClientRect().top + 'px';
            this.elements.lootHeading.innerHTML = qs('td.current').getAttribute('tooltip-title');
        };
        this.shift_viewport_vertically = function (distance) {
            this.coordinate.y += distance;
            if (distance > 0) {
                for (var i = 0; i < distance; i++) {
                    el.removeChild(el.lastChild);
                }

                var tl = this.get_topleft();
                this.generate_rows(tl, distance, w, 0);
            } else if (distance < 0) {
                for (var i = 0; i < Math.abs(distance); i++) {
                    el.removeChild(el.children[0]);
                }

                var tl = this.get_bottomleft();
                this.generate_rows(tl, Math.abs(distance), w);
            }
            var a = new Chunk(this, 25, {
                x: this.get_bottomleft().x,
                y: this.get_bottomleft().y
            });
            this.renderChunks([a]);
            this.elements.player.style.left = qs('td.current').getBoundingClientRect().left + 'px';
            this.elements.player.style.top = qs('td.current').getBoundingClientRect().top + 'px';
            this.elements.lootHeading.innerHTML = qs('td.current').getAttribute('tooltip-title');
        };
        this.shift_viewport_horizontally = function (distance) {
            this.coordinate.x += distance;
            if (distance > 0) {
                for (var i = 0; i < h; i++) {
                    var row = el.children;
                    var k = i;
                    for (var j = 0; j < distance; j++) {
                        row[k].removeChild(row[k].children[0]);
                    }
                }
                var tl = this.get_topright();
                this.generate_columns(tl, h, distance, -1);
            } else if (distance < 0) {
                for (var i = 0; i < h; i++) {
                    var row = el.children;
                    var k = i;
                    for (var j = 0; j < Math.abs(distance); j++) {
                        row[k].removeChild(row[k].lastChild);
                    }
                }

                var tl = this.get_topleft();
                this.generate_columns(tl, h, Math.abs(distance), 0);
            }
            var a = new Chunk(this, 25, {
                x: this.get_bottomleft().x,
                y: this.get_bottomleft().y
            });
            this.renderChunks([a]);
            this.elements.player.style.left = qs('td.current').getBoundingClientRect().left + 'px';
            this.elements.player.style.top = qs('td.current').getBoundingClientRect().top + 'px';
            this.elements.lootHeading.innerHTML = qs('td.current').getAttribute('tooltip-title');
        }

        function distance(cx, cy, ex, ey) {
            var dy = ey - cy;
            var dx = ex - cx;
            return {
                x: dx,
                y: dy
            };
        }

        $(document).mousemove(function (e) {
            global.GameObject.elements.tooltip.style.left = e.clientX + 15 + 'px';
            global.GameObject.elements.tooltip.style.top = e.clientY + 15 + 'px';
            var c = qs('#dialogue').getBoundingClientRect();
            var d = distance((c.left + c.right) / 2, (c.left + c.right) / 2, e.clientX, e.clientY);
            d.x = (360 - d.x / 70) % 360;
            d.y = (360 + d.y / 70) % 360;
            global.GameObject.elements.dialogueContainer.css({
                'transform': 'rotateX(' + d.y + 'deg) rotateY(' + d.x + 'deg)'
            });
        });

        $(document).mouseover(function (e) {
            var t = e.target;
            if ($(t).attr('tooltip-text') != null) {
                global.GameObject.elements.tooltipTitle.innerHTML = $(t).attr('tooltip-title');
                global.GameObject.elements.tooltipText.innerHTML = $(t).attr('tooltip-text');
                global.GameObject.elements.tooltip.style.opacity = 1;
            } else {
                global.GameObject.elements.tooltip.style.opacity = 0;
            }
        });
        var that = this;
        this.lootSpawn = function (chest) {
            this.items = [];
            var ammo = that.itemValues.ammo;
            ammo.amount = Math.floor(Math.random() * 10);
            var food = [that.itemValues.potato,
            that.itemValues.tomato,
            that.itemValues.grapes,
            that.itemValues.pie,
            that.itemValues.meat,
            that.itemValues.orange
            ];
            food = food[Math.floor(Math.random() * food.length)];
            food.amount = Math.floor(Math.random() * 3);
            var armour = that.itemValues.armour;
            armour.amount = Math.round(Math.random() - 0.25);
            if (armour.amount < 0)
                armour.amount = 0;
            if (ammo.amount != 0)
                this.items.push(ammo);
            if (food.amount != 0)
                this.items.push(food);
            if (armour.amount != 0)
                this.items.push(armour);
            var localthat = this;
            this.updateElements = function () {
                that.elements.loot.innerHTML = '';
                localthat.items.forEach(function (element) {
                    var container = document.createElement('div');
                    var span = document.createElement('span');
                    span.className = 'clickable take-loot';
                    span.innerText = 'Enter ↵';
                    var p = document.createElement('span');
                    p.innerText = element.amount + ' × ' + element.displayText + ' ' + element.name + ' ';
                    that.elements.loot.appendChild(p);
                    span.addEventListener('click', function () {
                        that.inventory.addItem(element);
                        var i = localthat.items.indexOf(element);
                        localthat.items.splice(i, 1);
                        that.inventory.updateElements();
                        localthat.updateElements();
                    });
                    p.setAttribute('tooltip-title', '[' + element.displayText + '] ' + element.name);
                    p.setAttribute('tooltip-text', element.description);
                    container.appendChild(p);
                    container.appendChild(span);
                    that.elements.loot.appendChild(container);
                });
            }
            this.updateElements();
        };

        this.Controller = function (keys) {
            var that = this;
            keys.forEach(function (key) {
                that[key.toLowerCase()] = false;
            });
            this.keyListener = function (e) {
                var hit = (e.type == 'keydown');
                var key = e.key.toLowerCase();
                that[key.toLowerCase()] = hit;
            }
        }

        this.Encounter = function (character, width, height, controller) {
            var tat = this;
            this.character = character;
            this.width = width;
            this.height = height;
            this.x = this.width / 2;
            this.y = this.height / 2;
            this.controller = controller;
            this.animationLoop = function () {
                if (tat.controller['w']) {
                    tat.y -= 5;
                }
                if (tat.controller['a']) {
                    tat.x -= 5;
                }
                if (tat.controller['s']) {
                    tat.y += 5;
                }
                if (tat.controller['d']) {
                    tat.x += 5;
                } //movement
                if (tat.x < 0) {
                    tat.x = 0;
                } else if (tat.x > tat.width - 15) {
                    tat.x = tat.width - 15;
                } else if (tat.y < -6) {
                    tat.y = -6;
                } else if (tat.y > tat.height - 27) {
                    tat.y = tat.height - 27;
                }
                that.elements.encounterPlayer.css({
                    left: tat.x,
                    top: tat.y
                });
                window.requestAnimationFrame(tat.animationLoop);
            };
            this.activate = function () {
                that.currentEncounter = this;
                document.onkeydown = tat.controller.keyListener;
                document.onkeyup = tat.controller.keyListener;
                that.elements.encounterBox.css({
                    width: tat.width + 'px',
                    height: tat.height + 'px'
                });
                window.requestAnimationFrame(tat.animationLoop);
            };
        }
        this.displayDialogue = function (text, character) {
            var arr = text.split('');
            var fill = [];
            var count = 0;
            if (character.indexOf('character:') >= 0) {
                var selectedCharacter = that.characters[character.split(':')[1]];
                $('#dialogue-character-container').css({
                    backgroundColor: (selectedCharacter.faces[character.split(':')[2]].color || selectedCharacter.color) + '88'
                });
                that.elements.dialogueCharacter.text(
                    selectedCharacter.faces[character.split(':')[2]].text
                );
                that.elements.dialogueCharacter.show();
            } else {
                that.elements.dialogueCharacter.hide();
            }
            if (that.dialogueInterval != undefined)
                clearInterval(that.dialogueInterval);
            that.dialogueInterval = setInterval(function () {
                if (count >= text.length) {
                    clearInterval(that.dialogueInterval);
                }
                fill.push(arr[count]);
                $('#dialogue-text').text(fill.join(''));
                qs('#dialogue-text').scrollTop = 1000;
                count++;
            }, 60);
            $('body').css({
                '--dialogue-display': 'block'
            });
        };

        function dragElement(elmnt) {
            var pos1 = 0,
                pos2 = 0,
                pos3 = 0,
                pos4 = 0;
            if (document.getElementById(elmnt.id + "header")) {
                /* if present, the header is where you move the DIV from:*/
                document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
            } else {
                /* otherwise, move the DIV from anywhere inside the DIV:*/
                elmnt.onmousedown = dragMouseDown;
            }

            function dragMouseDown(e) {
                e = e || window.event;
                e.preventDefault();
                // get the mouse cursor position at startup:
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                // call a function whenever the cursor moves:
                document.onmousemove = elementDrag;
            }

            function elementDrag(e) {
                e = e || window.event;
                e.preventDefault();
                // calculate the new cursor position:
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
                var newY = elmnt.offsetTop - pos2;
                var newX = elmnt.offsetLeft - pos1;
                var smacked = false;
                if (newY > 250 - elmnt.getBoundingClientRect().height) {
                    var diff = (250 - elmnt.getBoundingClientRect().height) - newY;
                    newY = 250 - elmnt.getBoundingClientRect().height;
                    if (smacked == false) {
                        smacked = true;
                        document.body.style.top = diff + 'px';
                        setTimeout(function () {
                            document.body.style.top = '0px';
                            smacked = false;
                        }, 80);
                    }
                }
                if (newY < -15) {
                    var diff = (-15) - newY;
                    newY = -15;
                    if (smacked == false) {
                        smacked = true;
                        document.body.style.top = diff + 'px';
                        setTimeout(function () {
                            document.body.style.top = '0px';
                            smacked = false;
                        }, 80);
                    }
                }
                if (newX > window.innerWidth * 1.05 - elmnt.getBoundingClientRect().width) {
                    var diff = (newX - (window.innerWidth * 1.05 - elmnt.getBoundingClientRect().width));
                    newX = window.innerWidth * 1.05 - elmnt.getBoundingClientRect().width;
                    if (smacked == false) {
                        smacked = true;
                        document.body.style.left = diff + 'px';
                        setTimeout(function () {
                            document.body.style.left = '0px';
                            smacked = false;
                        }, 80);
                    }
                }
                if (newX < window.innerWidth * 0.1) {
                    var diff = (window.innerWidth * 0.1) - newX;
                    newX = window.innerWidth * 0.1;
                    if (smacked == false) {
                        smacked = true;
                        document.body.style.left = '-' + diff + 'px';
                        setTimeout(function () {
                            document.body.style.left = '0px';
                            smacked = false;
                        }, 80);
                    }
                }
                // set the element's new position:
                elmnt.style.top = newY + "px";
                elmnt.style.left = newX + "px";
            }

            function closeDragElement() {
                /* stop moving when mouse button is released:*/
                document.onmouseup = null;
                document.onmousemove = null;
            }
        }
        dragElement(qs('#dialogue-character'));
        this.updateElements = function () {
            that.elements.hp.innerHTML = that.hp + '/' + that.maxhp;
            that.elements.energy.innerHTML = Math.round(that.getEnergy()) + '/' + that.maxEnergy;
        }

        this.save = function () {
            var savedGame = new GameSave();
            for (var k in that) {
                if (savedGame[k] != undefined)
                    savedGame[k] = that[k];
            };
            if (auth.currentUser != null) {
                database.ref('/keys/exp').once('value').then(function (snapshot) {
                    var value = snapshot.val().keyname;

                    function encryptDecrypt(input) {
                        var key = value.split(''); //Can be any chars, and any size array
                        var output = [];

                        for (var i = 0; i < input.length; i++) {
                            var charCode = input.charCodeAt(i) ^ key[i % key.length].charCodeAt(0);
                            output.push(String.fromCharCode(charCode));
                        }
                        return output.join("");
                    }

                    savedGame = {
                        savefile: encryptDecrypt(JSON.stringify(savedGame))
                    };
                    databaseref.child('/' + auth.currentUser.uid).set(savedGame);
                    console.log(savedGame);
                });
            };
        };
    }

    GameObject.prototype.Inventory = function (space, items) {
        var that = this;
        this.space = space;
        this.items = items || [];
        this.elements = {
            spaceused: {
                main: qs('#inv-status-container'),
                percent: qs('#percent')
            },
            stats: qs('#inventory-stats'),
            slots: qs('#inventory-slots'),
            scrollleft: qs('#inv-scroll-left'),
            scrollright: qs('#inv-scroll-right')
        };
        this.inventoryIndex = 0;
        this.updateElements = function () {
            var a = ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'];
            var b = 0;
            this.items.forEach(function (a) {
                b += a.amount;
            });
            var c = Math.round(b / this.space * 15);
            for (var i = 0; i < c; i++) {
                a[i] = '$';
            }
            this.elements.spaceused.main.innerText = b + '/' + that.space + ' slots used';
            this.elements.slots.innerText = '';

            that.items.forEach(function (element, index) {
                var slot = document.createElement('div');
                slot.innerText = element.displayText;
                slot.className = 'inv-slot';
                slot.setAttribute('tooltip-title', '[' + element.displayText + '] ' + element.name);
                slot.setAttribute('tooltip-text', element.description);
                slot.onclick = function () {
                    that.selectedItem = that.items[index];
                    $('.inv-slot-selected').each(function () {
                        this.classList.remove('inv-slot-selected');
                    });
                    slot.classList.add('inv-slot-selected'); //its correct in the debug memory but it is wrong
                };
                var label = document.createElement('div');
                label.className = 'inv-slot-label'; //what should we do now can u help i will work on the useItem function
                label.innerText = element.amount;
                slot.appendChild(label);
                that.elements.slots.appendChild(slot);
            });
        };
        this.elements.scrollleft.addEventListener('click', function () {
            if (that.items[that.inventoryIndex - 1] != null)
                that.inventoryIndex--;
            else
                return;
            that.updateElements();
        });
        this.elements.scrollright.addEventListener('click', function () {
            if (that.items[that.inventoryIndex + 5] != null)
                that.inventoryIndex++;
            else
                return;
            that.updateElements();
        });
        this.addItem = function (ITEM) {
            var t = 0;
            that.items.forEach(function (element) {
                t += element.amount;
            });
            if (t >= that.space) {
                //oops, inventory has no more space
            } else {
                //the next line is extremely important: make a clone of the original ITEM, so the update to the clone's properties will not affect ITEM
                var tmp = Object.assign({}, ITEM);
                if (tmp.amount + t > that.space)
                    tmp.amount = that.space - t;
                tmp.amount = Math.abs(tmp.amount);
                var existing = that.items.filter(item => (item.name === tmp.name));
                if (existing.length === 0) {
                    that.items.push(tmp);
                } else {
                    existing[0].amount += tmp.amount;
                }
            }
        };
        this.useItem = function (ITEM) {
            if (ITEM.amount > 0) {
                var game = global.GameObject;
                if (ITEM.properties.energy != undefined) {
                    game.setEnergy(game.getEnergy() + ITEM.properties.energy); //it doesn't update the energy for some reason
                }
                if (game.tileValues[ITEM.name.toLowerCase()] != undefined) {
                    var newTile = Object.assign({}, game.tileValues[ITEM.name.toLowerCase()]);
                    newTile.coordinates = this.coordinate;
                    game.setMapTile(newTile);
                }
                ITEM.amount--;
                game.updateElements();
                that.updateElements();
            }
        };
        this.updateElements();
    }

    GameObject.prototype.detectHit = function (bulletEl, target) {
        var b = bulletEl.getBoundingClientRect();
        var t = target.getBoundingClientRect();
        return (b.top <= t.top + 20 &&
            b.top >= t.top - 20 &&
            target.style.display != 'none' &&
            b.left >= t.left - 20 &&
            b.left <= t.left + 20);
    };

    GameSave.prototype.load = function () {
        var data = window.localStorage.getItem("exp-game/save");
        var value = '';
        database.ref('/keys/exp').once('value').then(function (snapshot) {
            value = snapshot.val().keyname;
        });

        function encryptDecrypt(input) {
            var key = value.split(''); //Can be any chars, and any size array
            var output = [];

            for (var i = 0; i < input.length; i++) {
                var charCode = input.charCodeAt(i) ^ key[i % key.length].charCodeAt(0);
                output.push(String.fromCharCode(charCode));
            }
            return output.join("");
        }
        if (auth.currentUser != null) {
            databaseref.child('/' + auth.currentUser.uid).once('value').then(function (snapshot) {
                if (snapshot.val() && snapshot.val().savefile != undefined) {
                    data = JSON.parse(encryptDecrypt(snapshot.val().savefile));
                    var newGameObject = Object.assign(new GameObject(), data);
                    console.log(newGameObject);
                    console.log(data);
                    console.log('loaded');
                    return newGameObject;
                }
            });
        }
        return new GameObject();
    };

    //global._exp_game = ((global._exp_game != null) ? global._exp_game : (new GameSave()).load());

    function shadedText(text) {
        return "<span class='shaded'>" + text + "</span>";
    }


    GameObject.prototype.Item = function (display_text, color, name, description, properties, amount) {
        this.displayText = display_text;
        this.color = color;
        this.name = name;
        this.description = description;
        this.properties = properties || {};
        this.amount = amount || 1;
    };

    global.GameObject = new GameSave().load();

    auth.onAuthStateChanged(function (user) {
        if (user) {
            global.GameObject = new GameSave().load();
        }
    });

    global.credits = document.querySelector('#credits');
    global.credits.roll = function () {
        global.credits.style.display = 'block';
        global.credits.style.animationName = 'creditsroll';
        global.credits.style.animationDuration = '7s';
        global.credits.style.animationTimingFunction = 'linear';
        setTimeout(function () {
            global.credits.style.display = 'none';
        }, 7000);
    };

    if ($('startscreen').html != '') {
        global.GameObject.elements.play.addEventListener('click', function () {
            global.GameObject.initialize_viewport();
            var soundtrack = new Audio();
            soundtrack.src = 'exp-main-soundtrack.mp3';
            soundtrack.loop = true;
            soundtrack.play();
            $('#startscreen').html('');
            $('#startscreen').css('display', 'none');
        });
    }

    global.GameObject.elements.hp.innerHTML = global.GameObject.hp + '/' + global.GameObject.maxhp;
    global.GameObject.elements.energy.innerHTML = Math.round(global.GameObject.getEnergy()) + '/' + global.GameObject.maxEnergy;
    global.GameObject.elements.optionsButton.addEventListener('click', function () {
        $('#options-modal').toggle();
        $('#mask').toggle();
    });
    global.GameObject.elements.effectsButton.addEventListener('click', function () {
        if (qs('html.effects-on') != null) {
            global.GameObject.elements.effectsButton.innerText = 'OFF';
            qs('html.effects-on').classList.remove('effects-on');
        } else {
            global.GameObject.elements.effectsButton.innerText = 'ON';
            qs('html').classList.add('effects-on');
        }
    });

    $('.modal-options-close').each(function (index) {
        $(this).click(function () {
            $(this).parent().parent().toggle();
            $('#mask').toggle();
        });
    });

    document.querySelector('#loading').style.display = 'none';

})(this, 25, 25, document.querySelector('#tds'));