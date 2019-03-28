(function(global, w, h, el) {
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

    var getMapTileKey = function(tile) {
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

    var qs = function(selector) {
        return document.querySelector(selector);
    };

    function Directions() {}
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

    function Chunk(game, sideLength, bottomleft, seed) {
        this.terrain = new Map();
        this.bottomleft = bottomleft;
        this.sideLength = sideLength;
        this.seed = seed;
        noise.seed(seed);
        for (var x = bottomleft.x; x < sideLength + bottomleft.x; x++) {
            for (var y = bottomleft.y; y < sideLength + bottomleft.y; y++) {
                var value = noise.simplex2(x / 100, y / 100);
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
                var newTile = new MapTile({
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
                }
                if (k < 4 && newTile.terrain.name == 'Dirt') {
                    newTile.terrain = global.GameObject.tileValues.tree;
                }
                if (newTile.coordinates.x == game.coordinate.x && newTile.coordinates.y == game.coordinate.y) {
                    newTile.loot = new game.lootSpawn(false);
                }
                if (game.getMapTile({
                        x: x,
                        y: y
                    }) != undefined)
                    newTile = game.getMapTile({
                        x: x,
                        y: y
                    });
                this.terrain.set(getMapTileKey(newTile), newTile);
            }
        }
        // var localthat = this;
    };


    function GameObject() {
        var that = this;
        this.coordinates = new Coordinate;
        this.facing = (new Directions).up();
        this.hp = 10;
        this.maxhp = 10;
        this.energy = 15;
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
            dialogueCharacter: $('#dialogue-character')
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
            water: new Tile('.', '03a9f4', 'Water', 'Two H and one O fused into one character.', {
                unbreakable: true
            }),
            dirt: new Tile('*', '6d4c41', 'Dirt', 'An abundant substance that plants grow in.'),
            sand: new Tile('~', 'fdd835', 'Sand', 'Tiny bits of shredded text make up sand.'),
            grass: new Tile(',', '4caf50', 'Grass', 'Created when artificial life met dirt.', {
                itemDrop: this.itemValues.dirt
            }),
            cactus: new Tile('🌵', 'fdd835', 'Cactus', 'A prickly plant that is tough enough to survive in the harsh desert.', {
                damage: 1
            }),
            tree: new Tile('🌲', '6d4c41', 'Tree', 'A tall plant with a thick trunk.', {
                itemDrop: this.itemValues.wood
            }),
            wood: new Tile('🏽', '826054', 'Wood', 'Strong organic material used to build structures.')
        };

        this.Face = function(text, color) {
            this.text = text;
            this.color = color || null;
        }

        this.Character = function(name, faces, color) {
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

        this.setMapTile = function(tile) {
            worldModifications.set(getMapTileKey(tile), tile);
        };

        this.getMapTile = function(coordinates) {
            return worldModifications.get(String(coordinates.x) + ',' + String(coordinates.y));
        };

        this.getTileElement = function(x, y) {
            return document.querySelector('#c_' + this.for_id(x) + '_' + this.for_id(y));
        };

        var that = this;
        this.renderChunks = function(chunks) {
            chunks.forEach(function(chunk) {
                for (var x = chunk.bottomleft.x; x < chunk.bottomleft.x + chunk.sideLength; x++) {
                    for (var y = chunk.bottomleft.y; y < chunk.bottomleft.y + chunk.sideLength; y++) {
                        var tile = that.getTileElement(x, y);
                        var k = chunk.terrain.get(getMapTileKey({
                            coordinates: {
                                x: x,
                                y: y
                            }
                        })).terrain;
                        tile.innerHTML = k.display_text;
                        var b = k.color + Math.floor((that.gameProgression + 1) / 5000 * 256 + 20).toString(16);
                        tile.style.background = '#' + b;
                        tile.setAttribute('tooltip-title', '[' + k.display_text + '] ' + k.name);
                        tile.setAttribute('tooltip-text', k.description);
                        if (chunk.terrain.get(getMapTileKey({
                                coordinates: {
                                    x: x + 1,
                                    y: y
                                }
                            })) != undefined && k.name != chunk.terrain.get(getMapTileKey({
                                coordinates: {
                                    x: x + 1,
                                    y: y
                                }
                            })).terrain.name) {
                            tile.style.borderRight = '2px #ffffffaa solid';
                            tile.style.paddingRight = '-2px';
                        }
                        if (chunk.terrain.get(getMapTileKey({
                                coordinates: {
                                    x: x,
                                    y: y + 1
                                }
                            })) != undefined && k.name != chunk.terrain.get(getMapTileKey({
                                coordinates: {
                                    x: x,
                                    y: y + 1
                                }
                            })).terrain.name) {
                            tile.style.borderTop = '2px #ffffffaa solid';
                            tile.style.paddingTop = '-2px';
                        }
                    }
                }
            });
        };

        this.get_topleft = function() {
            return {
                y: this.coordinate.y + Math.floor(h / 2),
                x: this.coordinate.x - Math.floor(w / 2)
            }
        };
        this.get_bottomleft = function() {
            return {
                x: this.coordinate.x - Math.floor(w / 2),
                y: this.coordinate.y - Math.floor(h / 2)
            }
        };
        this.get_topright = function() {
            return {
                x: this.coordinate.x + Math.floor(w / 2),
                y: this.coordinate.y + Math.floor(h / 2)
            }
        };
        this.get_bottomright = function() {
            return {
                x: this.coordinate.x + Math.floor(w / 2),
                y: this.coordinate.y - Math.floor(h / 2)
            }
        };
        this.for_id = function(n) {
            return String(Math.abs(n)) + (n < 0 ? "n" : "");
        };
        this.get_tile_id = function(sx, sy) {
            return "c_" + sx + "_" + sy;
        };
        this.updateCenterEl = function() {
            var c = document.querySelector("td.current");
            if (c) {
                c.classList.remove("current");
            }
            c = document.getElementById(this.get_tile_id(this.for_id(this.coordinate.x), this.for_id(this.coordinate.y)));
            if (c) {
                c.classList.add("current");
            }
        };
        this.generate_rows = function(topleft, n_rows, n_cols, start_index) {
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
        this.generate_columns = function(topleft, n_rows, n_cols, start_index) {
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

        this.initialize_viewport = function() {
            var topleft = this.get_topleft();
            this.generate_rows(topleft, h, w);
            var skips = 0;
            document.onkeypress = function(event) {
                if (document.activeElement != that.elements.name) {
                    var d = new Directions();
                    if (event.key === "W" || event.key === "w") {
                        that.shift_viewport_vertically(1);
                        that.facing = d.up();
                        that.elements.player.style.transform = 'rotate(0deg)';
                        global.GameObject.gameProgression++;
                    } else if (event.key === "S" || event.key === "s") {
                        that.shift_viewport_vertically(-1);
                        that.facing = d.down();
                        that.elements.player.style.transform = 'rotate(180deg)';
                        global.GameObject.gameProgression++;
                    } else if (event.key === "D" || event.key === "d") {
                        that.shift_viewport_horizontally(1);
                        that.facing = d.right();
                        that.elements.player.style.transform = 'rotate(90deg)';
                        global.GameObject.gameProgression++;
                    } else if (event.key === "A" || event.key === "a") {
                        that.shift_viewport_horizontally(-1);
                        that.facing = d.left();
                        that.elements.player.style.transform = 'rotate(270deg)';
                        global.GameObject.gameProgression++;
                    } else if (event.key === " ") {
                        $('body').css({
                            '--dialogue-display': 'none'
                        });
                        clearInterval(global.GameObject.dialogueInterval);
                    }
                }
                if (event.key != ' ') {
                    global.GameObject.displayDialogue('Salutations buddy! My name is Ctrl + Z. You just pressed the "' + event.key + '" key!', 'character:ctrlz:default');
                    if (skips > 9)
                        global.GameObject.displayDialogue('Hey, you better stop skipping my dialogue. It is not funny.', 'character:ctrlz:mad');
                    skips++;
                }
            };
            var a = new Chunk(this, 25, {
                x: this.get_bottomleft().x,
                y: this.get_bottomleft().y
            }, 32422);
            this.renderChunks([a]);
            this.elements.player.style.left = qs('td.current').getBoundingClientRect().left + 'px';
            this.elements.player.style.top = qs('td.current').getBoundingClientRect().top + 'px';
            this.elements.lootHeading.innerHTML = qs('td.current').getAttribute('tooltip-title');
        };
        this.shift_viewport_vertically = function(distance) {
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
            }, 32422);
            this.renderChunks([a]);
            this.elements.player.style.left = qs('td.current').getBoundingClientRect().left + 'px';
            this.elements.player.style.top = qs('td.current').getBoundingClientRect().top + 'px';
            this.elements.lootHeading.innerHTML = qs('td.current').getAttribute('tooltip-title');
        };
        this.shift_viewport_horizontally = function(distance) {
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
            }, 32422);
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

        $(document).mousemove(function(e) {
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

        $(document).mouseover(function(e) {
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
        this.lootSpawn = function(chest) {
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
            this.updateElements = function() {
                that.elements.loot.innerHTML = '';
                localthat.items.forEach(function(element) {
                    var span = document.createElement('span');
                    span.className = 'clickable';
                    span.innerText = 'Take';
                    var p = document.createElement('span');
                    p.innerText = element.amount + ' × ' + element.displayText + ' ' + element.name + ' ';
                    that.elements.loot.appendChild(p);
                    span.addEventListener('click', function() {
                        that.inventory.addItem(element);
                        var i = localthat.items.indexOf(element);
                        localthat.items.splice(i, 1);
                        that.inventory.updateElements();
                        localthat.updateElements();
                    });
                    p.setAttribute('tooltip-title', '[' + element.displayText + '] ' + element.name);
                    p.setAttribute('tooltip-text', element.description);
                    that.elements.loot.appendChild(span);
                    that.elements.loot.appendChild(document.createElement('br'));

                });
            }
            this.updateElements();
        };
        this.displayDialogue = function(text, character) {
            var arr = text.split('');
            var fill = [];
            var count = 0;
            if (character.indexOf('character:') >= 0) {
                var selectedCharacter = that.characters[character.split(':')[1]];
                that.elements.dialogueCharacter.css({
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
            that.dialogueInterval = setInterval(function() {
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
        }
        this.save = function() {
            var savedGame = new GameSave();
            for (var k in that) {
                if (savedGame[k] != undefined)
                    savedGame[k] = that[k];
            };
            if (auth.currentUser != null) {
                database.ref('/keys/exp').once('value').then(function(snapshot) {
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

    GameObject.prototype.Inventory = function(space, items) {
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
        this.updateElements = function() {
            var a = ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'];
            var b = 0;
            this.items.forEach(function(a) {
                b += a.amount;
            });
            var c = Math.round(b / this.space * 15);
            for (var i = 0; i < c; i++) {
                a[i] = '$';
            }
            var o = this;
            /*a.forEach(function(element) {
                if (element == "$") {
                    o.elements.spaceused.occupied.innerText += element;
                } else {
                    o.elements.spaceused.available.innerText += element;
                }
            });*/
            this.elements.spaceused.main.innerText = b + '/' + that.space + ' slots used';
            var j = this;
            for (var i = this.inventoryIndex; i < this.inventoryIndex + 5; i++) {
                var element = this.items[i];
                if (element == null)
                    return;
                var slot = document.querySelectorAll('.inv-slot')[i - that.inventoryIndex];
                $(slot).text(element.displayText);
                slot.setAttribute('tooltip-title', '[' + element.displayText + '] ' + element.name);
                slot.setAttribute('tooltip-text', element.description);
                $(slot).click(() => {
                    that.selectedItem = that.items[i - 1];
                    $('.inv-slot-selected').each(function() {
                        $(this).removeClass('inv-slot-selected');
                    });
                    $(slot).addClass('inv-slot-selected'); //its correct in the debug memory but it is wrong
                });
                var label = document.createElement('div');
                label.className = 'inv-slot-label'; //what should we do now can u help i will work on the useItem function
                label.innerText = element.amount;
                slot.appendChild(label);
            }
        };
        this.elements.scrollleft.addEventListener('click', function() {
            if (that.items[that.inventoryIndex - 1] != null)
                that.inventoryIndex--;
            else
                return;
            that.updateElements();
        });
        this.elements.scrollright.addEventListener('click', function() {
            if (that.items[that.inventoryIndex + 5] != null)
                that.inventoryIndex++;
            else
                return;
            that.updateElements();
        });
        this.addItem = function(ITEM) {
            var t = 0;
            that.items.forEach(function(element) {
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
        this.useItem = function(ITEM) {
            var game = global.GameObject;
            if (ITEM.properties.energy != undefined) {
                game.energy += ITEM.properties.energy; //it doesn't update the energy for some reason
            }
            if (game.tileValues[ITEM.name.toLowerCase()] != undefined) {
                game.setMapTile(global.GameObject.tileValues[ITEM.name.toLowerCase()]);
            }
            ITEM.amount--;
            that.updateElements();
        };
        this.updateElements();
    }

    function getAllElementsWithAttribute(attribute) {
        var matchingElements = [];
        var allElements = document.getElementsByTagName('*');
        for (var i = 0, n = allElements.length; i < n; i++) {
            if (allElements[i].getAttribute(attribute) !== null) {
                // Element exists with attribute. Add to array.
                matchingElements.push(allElements[i]);
            }
        }
        return matchingElements;
    }

    GameObject.prototype.detectHit = function(bulletEl, target) {
        var b = bulletEl.getBoundingClientRect();
        var t = target.getBoundingClientRect();
        return (b.top <= t.top + 20 &&
            b.top >= t.top - 20 &&
            target.style.display != 'none' &&
            b.left >= t.left - 20 &&
            b.left <= t.left + 20);
    };

    GameSave.prototype.load = function() {
        var data = window.localStorage.getItem("exp-game/save");
        var value = '';
        database.ref('/keys/exp').once('value').then(function(snapshot) {
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
            databaseref.child('/' + auth.currentUser.uid).once('value').then(function(snapshot) {
                if (snapshot.val().savefile != undefined) {
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


    GameObject.prototype.Item = function(display_text, color, name, description, properties, amount) {
        this.displayText = display_text;
        this.color = color;
        this.name = name;
        this.description = description;
        this.properties = properties || {};
        this.amount = amount || 1;
    };

    global.GameObject = new GameSave().load();

    auth.onAuthStateChanged(function(user) {
        if (user) {
            global.GameObject = new GameSave().load();
        }
    });

    global.credits = document.querySelector('#credits');
    global.credits.roll = function() {
        global.credits.style.display = 'block';
        global.credits.style.animationName = 'creditsroll';
        global.credits.style.animationDuration = '7s';
        global.credits.style.animationTimingFunction = 'linear';
        setTimeout(function() {
            global.credits.style.display = 'none';
        }, 7000);
    };

    /*GameObject.prototype.move = function (direction) {
        if (this.fightingMode == false && this.energy >= 0.4 && this.isTown == false) {
            if (direction == Directions.up()) {
                this.coordinates.y += 1;
                this.elements.player.style.transform = 'rotate(0deg)';
            }
            if (direction == Directions.right()) {
                this.coordinates.x += 1;
                this.elements.player.style.transform = 'rotate(90deg)';
            }
            if (direction == Directions.left()) {
                this.currentCell = (((this.currentCell + 1) % 25 != 1) ? this.currentCell - 1 : this.currentCell);
                this.player.style.transform = 'rotate(270deg)';
            }
            if (direction == Directions.down()) {
                this.currentCell = ((this.currentCell < 600) ? this.currentCell + 25 : this.currentCell);
                this.player.style.transform = 'rotate(180deg)';
            }
            this.player.style.top = qs('#c' + this.currentCell).getBoundingClientRect().y + 'px';
            this.player.style.left = qs('#c' + this.currentCell).getBoundingClientRect().x + 'px';
            this.facing = direction;
            this.steps++;
            this.stepsEl.innerHTML = 'Steps taken: ' + this.steps;
            this.energy -= 0.4;
            this.energyEl.innerHTML = 'Energy: ' + Math.round(energy) + '/' + maxEnergy;
            this.gameProgression++;
            var currentCellEl = qs('#c' + this.currentCell);
            if (!this.lootArray[this.currentCell])
                this.lootArray[this.currentCell] = new lootSpawn((this.currentCellEl.innerHTML == 'C'));
            var currentLoot = this.lootArray[this.currentCell];

            this.lootAmmo.innerHTML = this.currentLoot.ammo;
            this.lootFood.innerHTML = this.currentLoot.food;
            this.lootAmmoWrap.style.display = ((this.currentLoot.ammo == 0) ? 'none' : 'block');
            this.lootFoodWrap.style.display = ((this.currentLoot.food == 0) ? 'none' : 'block');
            this.lootArray[currentCell].take = this.takeF;
            if (this.currentCellEl.innerHTML == "'")
                this.lootHeading.innerHTML = "[']" + ' Plains';
            if (this.currentCellEl.innerHTML == "*")
                this.lootHeading.innerHTML = "[*]" + ' Forest';
            if (this.currentCellEl.innerHTML == ",")
                this.lootHeading.innerHTML = "[,]" + ' Swamp';
            if (this.currentCellEl.innerHTML == "C")
                this.lootHeading.innerHTML = "[C]" + ' Chest';
            if (this.currentCellEl.innerHTML == "T") {
                this.lootHeading.innerHTML = "[T]" + ' Town';
                this.isTown = true;
            }
            if (this.currentCellEl.innerHTML == " ")
                this.lootHeading.innerHTML = "[ ]" + ' Empty';
            if (Math.random() >= 0.80 && this.fightingMode == false && this.isTown == false) {
                this.saveBoxHTML = this.box.innerHTML;
                this.fightingMode = true;
                this.box.innerHTML = '';
                this.player.style.transform = 'rotate(0deg)';
                this.facing = Directions.up();
                this.player.style.left = 'calc(50% - 10px)';
                this.player.style.left = this.player.getBoundingClientRect().left + 'px';
                this.box.style.transform = 'scale(0.40)';
                this.box.style.borderWidth = '5px';
                this.player.style.top = this.box.offsetHeight - 140 + 'px';
                this.enemy.style.top = this.box.offsetHeight - 300 + 'px';
                this.enemyhp = this.enemyMaxhp;
                var that = this;
                setTimeout(function () {
                    var b = that.box.getBoundingClientRect();
                    that.enemy.style.left = that.player.style.left;
                    that.enemyhpEl.innerHTML = 'Enemy hp: ' + that.enemyhp + '/' + that.enemyMaxhp;
                    that.fighthpEl.innerHTML = 'hp: ' + that.hp + '/' + that.maxhp;
                    that.enemyhpEl.style.left = b.left + 'px';
                    that.enemyhpEl.style.top = b.top - 15 + 'px';
                    that.enemyhpEl.style.width = b.width + 'px';
                    that.fighthpEl.style.left = b.left + 'px';
                    that.fighthpEl.style.top = b.top + 2 + b.height + 'px';
                    that.fighthpEl.style.width = b.width + 'px';
                    that.fighthpEl.style.display = 'block';
                    that.enemyhpEl.style.display = 'block';
                    that.enemy.style.display = 'block';
                }, 1000);
                enemyDecisionInterval = setInterval(function () {
                    var enemyCoordinates = that.enemy.getBoundingClientRect();
                    if (that.playerIsShooting) {
                        if (that.enemyCoordinates.left + 20 == that.player.getBoundingClientRect().left) {
                            that.enemy.style.left = that.enemyCoordinates.left - 20 + 'px';
                        } else if (that.enemyCoordinates.left - 20 == that.player.getBoundingClientRect().left) {
                            that.enemy.style.left = that.enemyCoordinates.left + 20 + 'px';
                        } else {
                            that.enemy.style.left = that.enemyCoordinates.left + ((Math.random() >= .50) ? 20 : (-20)) + 'px';
                        }
                    } else if (that.enemyCoordinates.left == that.player.getBoundingClientRect().left) {
                        that.enemyShoot();
                        that.enemyCoordinates.left = that.player.getBoundingClientRect().left;
                    } else if (enemyCoordinates.left < that.player.getBoundingClientRect().left) {
                        that.enemy.style.left = that.enemyCoordinates.left + 20 + 'px';
                    } else if (that.enemyCoordinates.left > that.player.getBoundingClientRect().left) {
                        that.enemy.style.left = that.enemyCoordinates.left - 20 + 'px';
                    }
                    if (that.enemyCoordinates.left <= that.box.getBoundingClientRect().left + 12)
                        that.enemy.style.left = that.box.getBoundingClientRect().left + 12 + 'px';
                    that.enemy.style.left = that.box.getBoundingClientRect().left + 172 + 'px';
                    if (that.enemyhp <= 0)
                        clearInterval(enemyDecisionInterval);
                    that.enemyhpEl.innerHTML = 'Enemy hp: ' + that.enemyhp + '/' + that.enemyMaxhp;
                    that.fighthpEl.innerHTML = 'hp: ' + that.hp + '/' + that.maxhp;
                    that.hpEl.innerHTML = 'hp: ' + that.hp + '/' + that.maxhp;
                }, 320);
            }
            if (this.isTown == true) {
                this.saveBoxHTML = this.box.innerHTML;
                this.box.innerHTML = '';
                var tblt = ['<table><tr>'];
                for (var i = 0; i < 144; i++) {
                    tblt.push("<td id='c" + i + "'style='width:34.614px;height:34.614px;font-size:23.076px;'></td>");
                    if ((i + 1) % 12 == 0)
                        tblt.push('</tr><tr>');
                }
                tblt.push('</tr></table>');
                this.box.innerHTML = tblt.join('');
                this.player.style.transform = 'rotate(0deg)';
                this.facing = Directions.up();
                this.player.style.left = 'calc(50% - 10px)';
                this.player.style.left = this.player.getBoundingClientRect().left + 'px';
                this.box.style.transform = 'scale(0.52)';
                this.box.style.borderWidth = '5px';
                this.player.style.top = this.box.offsetHeight - 140 + 'px';
                this.gameProgression += 5;
            }
        } else if (this.fightingMode == true && this.energy >= 0.4) {
            if (this.direction == Directions.right()) {
                this.player.style.left = this.player.getBoundingClientRect().x + 20 + 'px';
            }
            if (this.direction == Directions.left()) {
                this.player.style.left = this.player.getBoundingClientRect().x - 20 + 'px';
            }
            if (this.player.getBoundingClientRect().left < this.box.getBoundingClientRect().left + 12)
                this.player.style.left = box.getBoundingClientRect().left + 12 + 'px';
            if (this.player.getBoundingClientRect().left > this.box.getBoundingClientRect().left + 172)
                this.player.style.left = box.getBoundingClientRect().left + 172 + 'px';
            this.steps++;
            this.stepsEl.innerHTML = 'Steps taken: ' + this.steps;
            this.gameProgression++;
        } else if (this.isTown == true && this.energy >= 0.4) {
            if (this.direction == Directions.right()) {
                this.player.style.left = this.player.getBoundingClientRect().x + 20 + 'px';
                this.player.style.transform = 'rotate(90deg)';
            }
            if (this.direction == Directions.left()) {
                this.player.style.left = this.player.getBoundingClientRect().x - 20 + 'px';
                this.player.style.transform = 'rotate(270deg)';
            }
            if (this.direction == Directions.down()) {
                this.player.style.top = this.player.getBoundingClientRect().y + 20 + 'px';
                this.player.style.transform = 'rotate(180deg)';
            }
            if (this.direction == Directions.up()) {
                this.player.style.top = this.player.getBoundingClientRect().y - 20 + 'px';
                this.player.style.transform = 'rotate(0deg)';
            }
            if (this.player.getBoundingClientRect().left < this.box.getBoundingClientRect().left + 12)
                this.player.style.left = this.box.getBoundingClientRect().left + 12 + 'px';
            if (this.player.getBoundingClientRect().left > this.box.getBoundingClientRect().left + 172)
                this.player.style.left = this.box.getBoundingClientRect().left + 172 + 'px';
            if (this.player.getBoundingClientRect().y < this.box.getBoundingClientRect().y)
                this.player.style.top = this.box.getBoundingClientRect().top + 'px';
            if (this.player.getBoundingClientRect().y > this.box.getBoundingClientRect().y + 174)
                this.player.style.top = this.box.getBoundingClientRect().top + 174 + 'px';
            this.steps++;
            this.stepsEl.innerHTML = 'Steps taken: ' + this.steps;
            this.gameProgression += 2;
        } else {
            log("You have no energy! Get food fast!");
        }
    }*/

    /*document.body.onkeyup = function (e) {
        if (document.activeElement != global.GameObject.elements.name) {
            if (e.key == "w" || e.key == "ArrowUp") {
                move(Directions.up());
            }
            else if (e.key == "d" || e.key == "ArrowRight") {
                move(Directions.right());
            }
            else if (e.key == "a" || e.key == "ArrowLeft") {
                move(Directions.left());
            }
            else if (e.key == "s" || e.key == "ArrowDown") {
                move(Directions.down());
            }
            else if (e.key == " ") {
                if (energy >= 0.2) {
                    shoot(facing);
                } else {
                    log("You have no energy! Get food fast!");
                }
            }
            else if (e.key == "e") {
                eat(1);
            }
            /*else if (e.key == "Escape") {
                if (fightingMode == true && energy >= 3) {
                    setTimeout(function () {
                        fightingMode = false;
                    }, 1500)
                    box.innerHTML = saveBoxHTML;
                    box.style.transform = 'scale(1.0)';
                    box.style.borderWidth = '2px';
                    setTimeout(function () {
                        this.player.style.top = qs('#c' + this.currentCell).getBoundingClientRect().y + 'px';
                        this.player.style.left = qs('#c' + this.currentCell).getBoundingClientRect().x + 'px';
                    }, 1500);
                    energyEl.innerHTML = 'Energy: ' + Math.round(energy) + '/' + maxEnergy;
                    enemy.style.display = 'none';
                    clearInterval(x);
                    this.playerIsShooting = false;
                    fighthpEl.style.display = 'none';
                    enemyhpEl.style.display = 'none';
                    gameProgression += 10;
                    energy -= 3;
                    energyEl.innerHTML = 'Energy' + Math.round(energy) + '/' + maxEnergy;
                } else if (isTown) {
                    setTimeout(function () {
                        fightingMode = false;
                        isTown = false;
                    }, 1500);
                    box.innerHTML = saveBoxHTML;
                    box.style.transform = 'scale(1.0)';
                    box.style.borderWidth = '2px';
                    setTimeout(function () {
                        this.player.style.top = qs('#c' + this.currentCell).getBoundingClientRect().y + 'px';
                        this.player.style.left = qs('#c' + this.currentCell).getBoundingClientRect().x + 'px';
                    }, 1500);
                    enemy.style.display = 'none';
                    clearInterval(x);
                    this.playerIsShooting = false;
                    fighthpEl.style.display = 'none';
                    enemyhpEl.style.display = 'none';
                    gameProgression += 10;
                    energy -= 3;
                    energyEl.innerHTML = 'Energy' + Math.round(energy) + '/' + maxEnergy;
                    isTown = false;
                    saveGame();
                }
                isTown = false;
                clearInterval(enemyDecisionInterval);
            } else if (e.key == 'Enter') {
                if ($('#startscreen').html() != '') {
                    regenDegenInterval = setInterval(function () {
                        if (Math.round(energy) > 0 && hp == maxhp)
                            energy--;
                        if (energy > maxEnergy)
                            energy = maxEnergy;
                        if (Math.round(energy) == maxEnergy && hp < maxhp) {
                            energy = maxEnergy;
                            hp += 3;
                        }
                        if (Math.round(energy) == 0) {
                            hp -= Math.floor(maxhp / 3);
                            hpEl.innerHTML = 'hp: ' + hp + '/' + maxhp;
                            log('You have no energy! Get food fast!');
                        }
                        if (hp < 0) {
                            var saveHTML = document.body.innerHTML;
                            document.body.innerHTML = "<p style='font-size: 100px; position: absolute; top: 0; height: 100%; width: 100%; text-align: center;'>YOU DIED<br><span style='font-size: 20px;'>respawning in: 3</span></p>"
                            setTimeout(function () {
                                document.body.innerHTML = "<p style='font-size: 100px; position: absolute; top: 0; height: 100%; width: 100%; text-align: center;'>YOU DIED<br><span style='font-size: 20px;'>respawning in: 2</span></p>"
                            }, 1000);
                            setTimeout(function () {
                                document.body.innerHTML = "<p style='font-size: 100px; position: absolute; top: 0; height: 100%; width: 100%; text-align: center;'>YOU DIED<br><span style='font-size: 20px;'>respawning in: 1</span></p>"
                            }, 2000);
                            setTimeout(function () {
                                hp = maxhp;
                                energy = maxEnergy;
                                ammo = 100;
                                food = 100;
                                fightingMode = false;
                                isTown = false;
                                saveGame();
                                location.reload();
                            }, 3000);
                        }
                        if (hp > maxhp)
                            hp = maxhp;
                        energyEl.innerHTML = 'Energy: ' + Math.round(energy) + '/' + maxEnergy;
                        hpEl.innerHTML = 'hp: ' + hp + '/' + maxhp;
                        saveGame();
                    }, 5000);
                    $('#startscreen').html('');
                    $('#startscreen').css('display', 'none');
                }
            }
        }
    }*/
    if ($('startscreen').html != '') {
        global.GameObject.elements.play.addEventListener('click', function() {
            regenDegenInterval = setInterval(function() {
                if (Math.round(energy) > 0 && hp == maxhp)
                    global.GameObject.energy--;
                if (global.GameObject.energy > global.GameObject.maxEnergy)
                    global.GameObject.energy = global.GameObject.maxEnergy;
                if (Math.round(energy) == global.GameObject.maxEnergy && global.GameObject.hp < global.GameObject.maxhp) {
                    global.GameObject.energy = global.GameObject.maxEnergy;
                    global.GameObject.hp += 3;
                }
                if (Math.round(energy) == 0) {
                    global.GameObject.hp -= Math.floor(global.GameObject.maxhp / 3);
                    global.GameObject.hpEl.innerHTML = global.GameObject.hp + '/' + global.GameObject.maxhp;
                }
                if (hp < 0) {
                    var saveHTML = document.body.innerHTML;
                    document.body.innerHTML = "<p style='font-size: 100px; position: absolute; top: 0; height: 100%; width: 100%; text-align: center;'>YOU DIED<br><span style='font-size: 20px;'>respawning in: 3</span></p>"
                    setTimeout(function() {
                        document.body.innerHTML = "<p style='font-size: 100px; position: absolute; top: 0; height: 100%; width: 100%; text-align: center;'>YOU DIED<br><span style='font-size: 20px;'>respawning in: 2</span></p>"
                    }, 1000);
                    setTimeout(function() {
                        document.body.innerHTML = "<p style='font-size: 100px; position: absolute; top: 0; height: 100%; width: 100%; text-align: center;'>YOU DIED<br><span style='font-size: 20px;'>respawning in: 1</span></p>"
                    }, 2000);
                    setTimeout(function() {
                        global.GameObject.energy = global.GameObject.maxEnergy;
                        global.GameObject.hp = global.GameObject.maxhp;
                        location.reload();
                    }, 3000);
                }
                if (global.GameObject.hp > global.GameObject.maxhp)
                    global.GameObject.hp = global.GameObject.maxhp;
                global.GameObject.elements.energy.innerHTML = Math.round(global.GameObject.energy) + '/' + global.GameObject.maxEnergy;
                global.GameObject.elements.hp.innerHTML = global.GameObject.hp + '/' + global.GameObject.maxhp;
            }, 5000);
            global.GameObject.initialize_viewport();
            var soundtrack = new Audio();
            soundtrack.src = 'exp-main-soundtrack.mp3';
            soundtrack.loop = true;
            soundtrack.play();
            $('#startscreen').html('');
            $('#startscreen').css('display', 'none');
        });
    }
    /*if (getCookie('map') == "") {
        var mapHTML;
        var textRows = generatedMap.match(/.{1,25}/g);
        for (var j = 0; j < 25; j += 2) {
            textRows[j] = textRows[j].split('').reverse().join('');
        }
        mapHTML = '<td>' + textRows.join('').split('').join('</td><td>') + '</td>';
        mapHTML = '<table><tr>' + mapHTML.match(/.{1,250}/g).join('</tr><tr>') + '</tr></table>';
        setCookie('map', generatedMap, 100);
    } else {
        mapHTML = getCookie('map');
        mapHTML = '<td>' + textRows.join('').split('').join('</td><td>') + '</td>';
        mapHTML = '<table><tr>' + mapHTML.match(/.{1,250}/g).join('</tr><tr>') + '</tr></table>';
        setCookie('map', generatedMap, 100);
    }
    box.innerHTML = mapHTML;
    document.querySelectorAll('td').forEach(function (element, index) {
        element.id = 'c' + index;
    });*/

    /*function shoot(direction) {
        if (ammo > 0) {
            var bullet = document.createElement('div');
            bullet.className = 'bullet';
            bullet.innerHTML = "<img src='bullet.png' height='18px' width='18px'>"
            bullet.style.top = this.player.getBoundingClientRect().y + 'px';
            bullet.style.left = this.player.getBoundingClientRect().x + 'px';
            this.playerX = this.player.getBoundingClientRect().x;
            this.playerY = this.player.getBoundingClientRect().y;
            document.body.appendChild(bullet);
            var i = 0;
            var x = setInterval(function () {
                if (direction == Directions.up()) {
                    bullet.style.top = this.playerY - i + 'px';
                } else if (direction == Directions.right()) {
                    bullet.style.left = this.playerX + i + 'px';
                } else if (direction == Directions.left()) {
                    bullet.style.left = this.playerX - i + 'px';
                } else if (direction == Directions.down()) {
                    bullet.style.top = this.playerY + i + 'px';
                }
                i += 10;
                this.playerIsShooting = true;
                if (detectHit(bullet, enemy) == true) {
                    console.log('yay!');
                    clearInterval(x);
                    bullet.parentNode.removeChild(bullet);
                    enemyhp--;
                    gameProgression += 3;
                    if (enemyhp <= 0) {
                        setTimeout(function () {
                            fightingMode = false;
                        }, 1500)
                        box.innerHTML = saveBoxHTML;
                        box.style.transform = 'scale(1.0)';
                        box.style.borderWidth = '2px';
                        setTimeout(function () {
                            this.player.style.top = qs('#c' + this.currentCell).getBoundingClientRect().y + 'px';
                            this.player.style.left = qs('#c' + this.currentCell).getBoundingClientRect().x + 'px';
                        }, 1500);
                        energyEl.innerHTML = 'Energy: ' + Math.round(energy) + '/' + maxEnergy;
                        enemy.style.display = 'none';
                        clearInterval(x);
                        this.playerIsShooting = false;
                        fighthpEl.style.display = 'none';
                        enemyhpEl.style.display = 'none';
                        gameProgression += 100;
                        saveGame();
                    }
                }
            }, 33);
            ammo--;
            ammoUsed++;
            ammoEl.innerHTML = 'Ammo: ' + ammo;
            ammoUsedEl.innerHTML = 'Ammo used: ' + ammoUsed;
            energy -= 0.2;
            energyEl.innerHTML = 'Energy: ' + Math.round(energy) + '/' + maxEnergy;
            gameProgression += 0.2;
            setTimeout(function () {
                clearInterval(x);
                this.playerIsShooting = false;
                if (bullet.parentNode != null) {
                    bullet.parentNode.removeChild(bullet);
                }
            }, 600);
        } else {
            log('Out of ammo! Reload.');
        }
    }

    function enemyShoot() {
        var bullet = document.createElement('div');
        bullet.className = 'bullet';
        bullet.innerHTML = "<img src='bullet.png' height='18px' width='18px'>"
        bullet.style.top = enemy.getBoundingClientRect().y + 'px';
        bullet.style.left = enemy.getBoundingClientRect().x + 'px';
        var enemyX = enemy.getBoundingClientRect().x;
        var enemyY = enemy.getBoundingClientRect().y;
        document.body.appendChild(bullet);
        var i = 0;
        var x = setInterval(function () {
            bullet.style.top = enemyY + i + 'px';
            i += 10;
            if (detectHit(bullet, this.player)) {
                console.log('boo!');
                bullet.parentNode.removeChild(bullet);
                hp--;
                if (hp <= 0) {
                    setTimeout(function () {
                        fightingMode = false;
                    }, 1500)
                    box.innerHTML = saveBoxHTML;
                    box.style.transform = 'scale(1.0)';
                    box.style.borderWidth = '2px';
                    energyEl.innerHTML = 'Energy: ' + Math.round(energy) + '/' + maxEnergy;
                    enemy.style.display = 'none';
                    clearInterval(x);
                    this.playerIsShooting = false;
                    fighthpEl.style.display = 'none';
                    enemyhpEl.style.display = 'none';
                    setTimeout(function () {
                        this.player.style.top = qs('#c' + this.currentCell).getBoundingClientRect().y + 'px';
                        this.player.style.left = qs('#c' + this.currentCell).getBoundingClientRect().x + 'px';
                    }, 1500);
                    energyEl.innerHTML = 'Energy: ' + Math.round(energy) + '/' + maxEnergy;
                    enemy.style.display = 'none';
                    clearInterval(x);
                    document.body.innerHTML = "<p style='font-size: 100px; position: absolute; top: 0; height: 100%; width: 100%; text-align: center;'>YOU DIED<br><span style='font-size: 20px;'>respawning in: 3</span></p>"
                    setTimeout(function () {
                        document.body.innerHTML = "<p style='font-size: 100px; position: absolute; top: 0; height: 100%; width: 100%; text-align: center;'>YOU DIED<br><span style='font-size: 20px;'>respawning in: 2</span></p>"
                    }, 1000);
                    setTimeout(function () {
                        document.body.innerHTML = "<p style='font-size: 100px; position: absolute; top: 0; height: 100%; width: 100%; text-align: center;'>YOU DIED<br><span style='font-size: 20px;'>respawning in: 1</span></p>"
                    }, 2000);
                    setTimeout(function () {
                        energy = maxEnergy;
                        hp = maxhp;
                        ammo = 100;
                        food = 10;
                        location.reload();
                    }, 3000);
                }
                hp.innerHTML = 'hp: ' + hp + '/' + maxhp;
                clearInterval(x);
            }
            hp.innerHTML = 'hp: ' + hp + '/' + maxhp;
        }, 33);
        setTimeout(function () {
            clearInterval(x);
            if (bullet.parentNode != null) {
                bullet.parentNode.removeChild(bullet);
            }
        }, 600);
    }*/

    setInterval(function() {
        name = global.GameObject.elements.name.innerHTML;
    }, 1000);

    global.GameObject.elements.name.innerHTML = global.GameObject.name;
    global.GameObject.elements.hp.innerHTML = global.GameObject.hp + '/' + global.GameObject.maxhp;
    global.GameObject.elements.energy.innerHTML = Math.round(global.GameObject.energy) + '/' + global.GameObject.maxEnergy;
    global.GameObject.elements.optionsButton.addEventListener('click', function() {
        var duck = global.GameObject.elements.optionsModal.style.display;
        $('#options-modal').toggle();
        $('#mask').toggle();
    });
    global.GameObject.elements.effectsButton.addEventListener('click', function() {
        if (qs('html.effects-on') != null) {
            global.GameObject.elements.effectsButton.innerText = 'OFF';
            qs('html.effects-on').classList.remove('effects-on');
        } else {
            global.GameObject.elements.effectsButton.innerText = 'ON';
            qs('html').classList.add('effects-on');
        }
    });

    $('.modal-options-close').each(function(index) {
        $(this).click(function() {
            $(this).parent().parent().toggle();
            $('#mask').toggle();
        });
    });

    var count = 1;

    function glitchInterval() {
        setTimeout(function() {
            var savePlayerCoordinates = this.player.getBoundingClientRect();
            $('html').css({
                'position': 'absolute',
                'left': '89px'
            });
            setTimeout(function() {
                $('html').css('transform', 'scale(1.2), rotate(180deg)')
            }, 100);
            setTimeout(function() {
                $('html').css({
                    'filter': 'invert(1)',
                    'left': '0'
                })
            }, 150);
            setTimeout(function() {
                $('html').css({
                    'filter': 'none',
                    'transform': 'none',
                    'position': 'relative'
                });
                this.player.style.left = savePlayerCoordinates.left + 'px';
                this.player.style.top = savePlayerCoordinates.top + 'px';
            }, 200);
            count++;
        }, (10000000 / global.GameObject.gameProgression) * count);
    }

    glitchInterval();

    $('#hugeheading').mgGlitch({
        // set 'true' to stop the plugin
        destroy: false,
        // set 'false' to stop glitching
        glitch: true,
        // set 'false' to stop scaling
        scale: true,
        // set 'false' to stop glitch blending
        blend: true,
        // select blend mode type
        blendModeType: 'hue',
        // set min time for glitch 1 elem
        glitch1TimeMin: 100,
        // set max time for glitch 1 elem
        glitch1TimeMax: 500,
    });

    $('#by2kinc').css({
        'clip': 'unset',
        'left': '0'
    });

    document.querySelector('#loading').style.display = 'none';

})(this, 25, 25, document.querySelector('#tds'));
