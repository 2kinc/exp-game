function ViewPort(center){
    this.width = 25;
    this.height = 25;
    this.center = center || new Coordinate(0,0);
    
    this.topleft() = function(){
        return new Coordinate();
    };
    this.topright() = function(){
        return new Coordinate();
    };
    this.bottomleft() = function(){
        return new Coordinate();
    };
    this.bottomright() = function(){
        return new Coordinate();
    };

    this.update_center = function(new_center){
        if(typeof this.before_update_center == "function"){
            this.before_update_center(this.center, new_center);
        }

        this.center.x = new_center;

    };
}

function Coordinate(x,y){
    this.x = x || 0;
    this.y = y || 0;
}