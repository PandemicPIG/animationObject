var animateOject = function(data){

    var _this = this;
    
    this.dev = true;
    this.conf = data;
    this.timeline = JSON.stringify(data);
    this.timeline_position = 0;
    this.met_state = 0;
    this.state = 'play';
    this.ease = '';
    this.scale = '';
    this.top = '';
    this.left = '';
    this.translate = '';
    this.rotate = '';
    //this.opacity = 'opacity(1)';
    this.opacity = 1;
    this.blur = 'blur(0px)';
    this.skipping_array = [];
    this.skipping_loop = [];
    this.direction = 'fwd'; // fwd | bkd
    
    window.addEventListener('load', function(){
        _this.element = document.getElementById(_this.conf.id);
        _this.set_visibility();
        _this.init();
    });
 
}

animateOject.prototype.init = function(){
    this.obj = document.getElementById(this.conf.id);
    this.log(this.conf.id);
    this.conf = JSON.parse(this.timeline);
    //call fist animation - or make list and call by duration?
    this.anim_call(this.conf.timeline[this.timeline_position]);
}

animateOject.prototype.anim_call = function(obj){
    this.met_state = 0;
    var anim = obj.anim.split(/\&/);
    
    this.log(obj, anim, anim.length);
    
    if (anim.length == 1) this.sort_animations(obj, anim.length);
    else if( anim.length > 1 )
    {
        this.log('multiple animation');
        for( var i = 0; i < anim.length; i++ )
        {
            obj.anim = anim[i];
            this.sort_animations(obj, anim.length);
        }
    }
    
    this.class_dynamics(obj);
}

animateOject.prototype.class_dynamics = function(obj){
    var prev_class = this.element.getAttribute('class');
    var classes = prev_class != null ? prev_class.match(/([_a-zA-Z0-9-]+)/g) : null;
    this.log('object classes for', obj.anim, classes);
    var ready = true;
    
    if( typeof obj.addClass != 'undefined' )
    {   
        var filter = obj.addClass.match(/([_a-zA-Z0-9-]+)/g);
        if( classes != null )
        {
            var new_cls = prev_class + ' ' + this.filter(filter,classes);
            this.element.setAttribute('class', new_cls);
        }
        else this.element.setAttribute('class', obj.addClass);
    }
    
    if( typeof obj.removeClass != 'undefined' && classes != null )
    {
        var filter = obj.removeClass.match(/([_a-zA-Z0-9-]+)/g);
        var new_cls = this.filter(classes,filter);
        this.element.setAttribute('class', new_cls);
    }
    
    if( typeof obj.content != 'undefined' )
    {
        this.element.innerHTML = obj.content;
    }
}

animateOject.prototype.filter = function(main, filter){
    var output = '';

    for( var i = 0;  i < main.length; i++ )
    {
        var safe = true;

        for( var j = 0; j < filter.length; j++ )
        {
            if( main[i] == filter[j] ) safe = false;
        }

        output += output == '' ? '' : ' ';
        output += safe == true ? main[i] : '';
    }
    
    this.log(output);
    return output;
}

animateOject.prototype.sort_animations = function(obj, req){
    
    this.ease = typeof obj.ease != 'undefined' ? obj.ease : 'ease-in-out'; 
    
    switch(obj.anim){
        case 'pause':
            //pause
            this.anim_fx_pause(obj.duration, req);
            break;
        case 'slide':
            //slide animation to coords
            this.anim_fx_slide(obj.duration, obj.distance, req);
            break;
        case 'zoom':
            //zoom to new size
            this.anim_fx_zoom(obj.duration, obj.z_to, req);
            break;
        case 'fade':
            //fade in or opacity??
            this.anim_fx_opacity(obj.duration, obj.f_to, req);
            break;
        case 'fade-in':
            //fade in or opacity??
            this.anim_fx_opacity(obj.duration, 1, req);
            break;
        case 'fade-out':
            //fade out or opacity??
            this.anim_fx_opacity(obj.duration, 0, req);
            break;
        case 'blur':
            //blur to??
            this.anim_fx_blur(obj.duration, obj.spread, req);
            break;
        case 'rotate':
            //rotate to new angle
            this.anim_fx_rotate(obj.duration, obj.angle, req);
            break;
        case 'go':
            this.anim_fx_goto(obj);
            break;
        case 'reverse':
            this.anim_fx_reverse(obj, req);
            break;
        case 'stop':
            this.state = 'stop';
            this.log('stopped :)');
            break;
        default:
            //create composit animation
            this.log('no method set');
            this.call_next('skip');
    }
}

animateOject.prototype.anim_fx_slide = function(duration, distance, req){
    this.log(this.timeline_position, 'slide methode initiated...');
    this.top = distance[0] + 'px';
    this.left = distance[1] + 'px';
    this.apply_state(duration, req);
}

animateOject.prototype.anim_fx_zoom = function(duration, to, req){
    this.log(this.timeline_position, 'zoom methode initiated...');
    this.scale = 'scale(' + to + ',' + to + ')';
    this.apply_state(duration, req);
}

animateOject.prototype.anim_fx_rotate = function(duration, angle, req){
    this.log(this.timeline_position, 'rotate methode initiated...');
    this.rotate = 'rotate(' + angle + 'deg)';
    this.apply_state(duration, req);
}

animateOject.prototype.anim_fx_opacity = function(duration, to, req){
    this.log(this.timeline_position, 'opacity methode initiated...');
    if(to > 1) to = 1;
    //this.opacity = 'opacity(' + to + ')';
    this.opacity = to;
    this.apply_state(duration, req);
}

animateOject.prototype.anim_fx_blur = function(duration, spread, req){
    this.log(this.timeline_position, 'blur methode initiated...');
    this.blur = 'blur(' + spread + 'px)';
    this.apply_state(duration, req);
}

animateOject.prototype.anim_fx_pause = function(duration, req){ 
    this.log(this.timeline_position, 'pause methode initiated...');
    this.apply_state(duration, req);
}

animateOject.prototype.anim_fx_goto = function(obj){
    this.log('one big happy family');
    this.log(obj.to, obj.and);
    switch(obj.and) {
        case 'stop':
            this.state = 'stop';
        case 'play-backwards':
            this.direction = 'bkd';
            this.timeline_position = obj.to - 1;
            this.init();
            break;
        case 'play':
            this.direction = 'fwd';
            this.timeline_position = obj.to - 1;
            this.init();
            break;
        case 'play-and-skip-go':
            this.direction = 'fwd';
            this.skipping_array.push(this.timeline_position);
            this.timeline_position = obj.to - 1;
            this.init();
            break;
    }
}

animateOject.prototype.anim_fx_reverse = function(obj, req){
    this.log('one small joyful family');
}

animateOject.prototype.apply_state = function(duration, req){
    this.met_state++;
    this.log('state>>>', this.met_state, req);
    if(this.met_state == req)
    {
        //regex tranlate and add offset
        var x = this.element.offsetWidth/2;
        var y = this.element.offsetHeight/2;
        
        this.log('duration >>>', duration,x,y);
        
        //this.element.style.WebkitTransition = 'all ' + duration + ' ' + this.ease;
        this.element.style.transition = 'all ' + duration + ' ' + this.ease;
        
        this.log('app-xy >>>',x,y);
        //this.element.style.WebkitTransformOrigin = x + 'px ' + y + 'px';
        this.element.style.transformOrigin = x + 'px ' + y + 'px';
        
        //this.element.style.WebkitTransform = this.scale + ' ' + this.translate + ' ' + this.rotate;
        this.element.style.transform = this.scale + ' ' + this.translate + ' ' + this.rotate;
        
        this.element.style.top = this.top;
        this.element.style.left = this.left;
        
        this.log(this.opacity + ' ' + this.blur);
        
        //this.element.style.WebkitFilter = this.opacity + ' ' + this.blur;
        //this.element.style.filter = this.opacity + ' ' + this.blur;

        this.element.style.opacity = this.opacity;
        
        this.call_next('next', duration);
        
    }
}

animateOject.prototype.set_visibility = function(){
    this.log( this.conf.start );
    
    switch(this.conf.start) 
    {
        case 'hidden':
            //this.opacity = 'opacity(0)';
            this.opacity = 0;
            break;
        case 'visible':
            //this.opacity = 'opacity(1)';
            this.opacity = 1;
            break;
    }
    
    //this.element.style.WebkitFilter = this.opacity + ' ' + this.blur;
    //this.element.style.filter = this.opacity + ' ' + this.blur;
    
    this.element.style.opacity = this.opacity;
    
    //this.element.style.opacity = 1;
    this.element.style.visibility = 'visible';
    this.element.style.display = 'block';
}

animateOject.prototype.log = function(){
    var string = '';
    for( var i = 0; i < arguments.length; i++ ) string += string == '' ? 'arguments[' + i + ']' : ', arguments[' + i + ']';
    if(this.dev == true) eval('console.log('+string+')');
}

animateOject.prototype.call_next = function(arg, duration){
    var _this = this;
    
    this.log(arg, this.direction);
    
    switch( arg )
    {
        case 'skip':
            this.increment();
            for( var i = 0; i < this.skipping_array.length; i++) if( this.skipping_array[i] == this.timeline_position ) this.increment();
            if(typeof this.conf.timeline[this.timeline_position] != 'undefined') this.init();
            else this.log('end of timeline.');
            break;
        case 'next':
            this.increment();
            for( var i = 0; i < this.skipping_array.length; i++) if( this.skipping_array[i] == this.timeline_position ) this.increment();
            if(typeof this.conf.timeline[this.timeline_position] != 'undefined' && this.state == 'play') setTimeout(function(){
                _this.anim_call(_this.conf.timeline[_this.timeline_position]);
            },duration.match(/([\d]+)ms/)[1]);
            else
            {
                this.log('end of timeline.');
            }
            break;
    }  
}

animateOject.prototype.increment = function(){
    if( this.direction == 'fwd' ) this.timeline_position++;
    if( this.direction == 'bkd' ) this.timeline_position--;
}