# How the game works

- The player spawns into a world
- The world is rendered into a text-based box
- The box is a big HTML `<table>`
- ASCII characters are used to represent different terrians or player-built structures
- Player can move around using arrow keys or W/A/S/D
- The world is covered in mist intially. Only areas close to player is "uncovered" and visible to player. Once an area is uncovered it will stay visible to player at all times.
- Player can shoot with spacebar and eat food with E.
- Player starts out with 10/10 hp
- Can get damaged and level up to a higher max hp by collecting armour
- Player can carry an amount of items depending on how much inventory space they buy
- Basic items include ammo, food, fuel, and armour
- By default magazine size for gun is 15
- Can upgrade gun or build/find better guns
- Can find towns, houses, lakes, mines, and mountains - structures lead to sub-areas
- Can encounter different enemies with varying determination to kill you, depending on your interaction with them, and which enemy it is
- Can spare or fight enemies, sparing them is chance based, if you spare the enemy, you can sometimes talk to them and interact
- Can build houses by placing a material in a rectangular grid - game will recognize and create the corresponding structure
- Towns will have paths, houses, farms, and passive enemies
- Lakes have an area of water you can fish in, and hunt ducks. Player can build a house in a lake sub-area
- As player progresses through the game the game will generate unique enemies depending on the decisions the player makes, creating a improvised plot. This plot will be completely unique but the ultimate goal(s?) of the game will remain the same
- The player can combine items to hopefully create new ones and advance their technology
- Player can go to mines to collect metals and craft them into alloys
- Player can build machines with metals and alloys and power them with fuel or turn input into fuel (resource harvester, mining machine, solar panels, coal burner)
- Player can harvest trees and collect wood
- In the beginning of the game, it is only black and white, but slowly color starts to come into the game in places like flashing red when hit, flashing green when successfully built or upgraded item, or popping in as a status indicator, or just being in a random place
- Game gets slowly more infested by glitching effects as player progresses

# Type system design

## Game object types

- Player
  - Name 
  - Energy (Current/Max)
  - HP (Current/Max)
  - Armour (equipped) (in progress on master branch)
  - XP
  - Inventory (list of items) (in progress)
  - Food (Numeric, will be replaced with food item)
  - Ammo (Numeric, will be replaced with ammo item)
- Items (in progress)
  - Food
  - Ammo
  - Fuel
  - Wood
  - Metals
    - Iron etc
  - Machines (Input/output machines, transportation, harvesters, mining, creating fuel, using fuel to create stuff)
    - Coal burners
    - Solar Panels
    - Furnaces
    - Resource harvesters
  - Chests
- Structures (Placed by arranging certain blocks in a certain pattern or naturally spawning, creates sub area) (future)
  - Houses
  - Lakes
  - Mines
  - Mountains