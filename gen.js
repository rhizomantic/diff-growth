var scr, scripts = [];

function locs_spread(_c) {
    let c = {n:5, r:100, x1:100, x2:skw-100, y1:100, y2:skh-100, ..._c};

    let ps = [];
    for(let i=0; i<c.n; i++) {
        let r = c.r;
        let px, py, skp;
        for(let j=0; j<50; j++) {
            px = random(c.x1, c.x2);
            py = random(c.y1, c.y2);
            skp = false;
            for(let pos of spreadLocs) {
                if(dist(px, py, pos.x, pos.y) < r+pos.r) {
                    skp = true;
                    break;
                }
            }
            if(skp) continue;
            break;
        }
        ps.push({n:i, x:px, y:py, r:r});
        spreadLocs.push({x:px, y:py, r:r});

    }

    return ps;
}

function locs_grid(_c) {
    let c = {
        n: 9,
        cs: 3,
        rs: 3,
        frame: {x:0, y:0, w:skw, h:skh},
        ..._c
    }

    let ps = [];
    //let n = 0;
    for(let i=0; i<c.n; i++) {
        let nc = i % c.cs;
        let nr = floor(i/c.cs)
        let px = c.frame.x + c.frame.w/(c.cs) * (nc+0.5);
        let py = c.frame.y + c.frame.h/(c.rs) * (nr+0.5);
        ps.push({n:i, x:px, y:py});
        spreadLocs.push({x:px, y:py});
    }

    return ps;
}

class GrowBlob extends Thing { 
    constructor(c) {
        super(c);

        this.num = 'num' in c ? c.num : 100;
        this.inum = c.inum || 8;
        this.count = 0;
        this.every = 'every' in c ? c.every : 5;
        this.blow = 'blow' in c ? c.blow : 3;
        this.rot = 'rot' in c ? c.rot : 0;
        this.ord = 'ord' in c ? c.ord : true;
        //this.anchorCf = 'anchor' in c ? c.anchor : null;

        // if(this.anchorCf != null){
        //     let type = this.anchorCf.type || 'bone';
        //     this.anchor = new Node(this, {type:type, cx:c.cx, cy:c.cy, damp:0.1});
        //     this.bones.push(this.anchor);
        // }

        //let ba = random(TWO_PI);
        let a = 0, r = (gap*this.inum*0.7) / TWO_PI;
        let neo, pv = null;
        for(let i=0; i<this.inum; i++) {
            a = this.rot + TWO_PI/this.inum * i;

            neo = new Node(this, {...c, r:22, cx:c.cx + r*cos(a), cy:c.cy + r*sin(a)})

            // if(this.anchorCf != null) neo.addForce( {type:'spring', f:0.01, len:r, name:this.anchor.name, ...this.anchorCf} );

            if(pv !== null) {
                neo.pv = pv;
                pv.nx = neo;
            } else {
                this.root = neo;
            }
            pv = neo;

            this.count ++;
        }
        neo.nx = this.root;
        this.root.pv = neo;

        // this.findOpposites();
    }

    update(){
        super.update();

        if(this.count < this.num && this.mT % this.every == 1) {
            let dad = this.ord ? this.root : pick(this.skin);
            this.insertAfter(dad, this.config);
            this.count ++;
            //this.findOpposites();
        }

    }
}


// objeto
var scr = {
    id: "spread12_wind",
    name: "12 blobs empujados por el viento",
    num: 12,
    count: 0,
    every: 30,

    init: function() {
        this.count = 0;
        this.col = pick(front);
        this.rot = random(PI*2);
    
    },

    update: function() {
        if(t % this.every == this.every-1 && this.count < this.num) {
            let cx, cy, mg = 50;
            cx = random(mg, skw-mg); cy = random(mg, skh-mg);
            let fs = [
                {type:'wind', f:0.15, a:random(PI*2)},
                {type:'loop', f:1/5},
                {type:'local', f:2, from:2, reach:2},
            ]
            let cl = this.col; //front[this.count % front.length]
            let rt = this.rot;
            new GrowBlob({cx:cx, cy:cy, rot:rt, forces:fs, num:60, every:5, damp:0.85, col:cl, alpha:255, weight:3, stroke:back, ord:false});
            this.count ++;
        }
    }
}
scripts.push(scr);

var scr = {
    id: "grid16_wind",
    name: "grilla 16 blobs con viento",

    init: function() {
      
        //this.col = pick(front);
        let rot = random(PI*2);

        let locs = locs_grid({n:16, cs:4, rs:4})

        for(let lc of locs){
            let fs = [
                {type:'wind', f:0.15, a:random(PI*2)},
                {type:'loop', f:1/5},
                {type:'local', f:2, from:2, reach:2},
            ]

            new GrowBlob({
                cx:lc.x,
                cy:lc.y,
                rot:rot,
                forces:fs,
                num:90,
                every:5,
                damp:0.85,
                col:front[lc.n % front.length],
            });
        }
    },

    // update: function() {
        
    // }
}
scripts.push(scr);

var scr = {
    id: "grow_flower6",
    name: "flor x6 local",
    count: 0,
    num: 1200,
    mT: 0,
    every: 3,
    thig: null,
    dads: [],

    init: function() {
        let petals = 6;
        this.thing = new Thing({col:front[0]});

        let fs = [
            {type:'loop', f:1/5},
            //{type:'local', f:2, from:4, reach:2},
            {type:'spring', f:0.1, len:30, name:'centroid'}
            // {type:'push', f:1, name:'centroid'}
            //{type:'outwards', f:0.03, cw:true}
            
        ]

        let a = 0, r = (gap*petals*0.7) / TWO_PI;
        let neo, pv = null;
        for(let i=0; i<petals; i++) {
            a = TWO_PI/petals * i;

            neo = new Node(this.thing, {cx:skw/2 + r*cos(a), cy:skh/2 + r*sin(a), forces:fs})
            this.dads.push(neo);

            if(pv !== null) {
                neo.pv = pv;
                pv.nx = neo;
            } else {
                this.thing.root = neo;
            }
            pv = neo;

            this.count ++;
        }
        neo.nx = this.thing.root;
        this.thing.root.pv = neo;

    },

    update: function() {
        if(this.count < this.num && this.mT % this.every == 1) {
            let fs = [
                {type:'loop', f:1/5},
                // {type:'smooth', f:0.1}
                {type:'local', f:2, from:2, reach:3},
                // {type:'push', f:{src:'t', cv:'pow', to:30, nd:29, pw:2, mn:1, mx:0 }, name:'centroid'}
                // {type:'outwards', f:{src:'t', cv:'pow', to:30, nd:29, pw:0.5, mn:1, mx:0 }, cw:true}
            ]

            // let dad = pick(this.thing.skin);
            let dad = this.dads[this.count % this.dads.length];
            this.thing.insertAfter(dad, {forces: fs});
            this.count ++;
            //this.findOpposites();
        }

        this.mT ++;
    }
}
scripts.push(scr);

var scr = {
    id: "grow_blob6",
    name: "blob x6 local",
    count: 0,
    num: 1200,
    mT: 0,
    every: 3,
    thig: null,
    dads: [],

    init: function() {
        let petals = 6;
        this.thing = new Thing({col:front[0]});

        let fs = [
            {type:'loop', f:1/5},
            //{type:'local', f:2, from:4, reach:2},
            // {type:'spring', f:0.1, len:30, name:'centroid'}
            // {type:'push', f:1, name:'centroid'}
            //{type:'outwards', f:0.03, cw:true}
            
        ]

        let a = 0, r = (gap*petals*0.7) / TWO_PI;
        let neo, pv = null;
        for(let i=0; i<petals; i++) {
            a = TWO_PI/petals * i;

            neo = new Node(this.thing, {cx:skw/2 + r*cos(a), cy:skh/2 + r*sin(a), forces:fs})
            this.dads.push(neo);

            if(pv !== null) {
                neo.pv = pv;
                pv.nx = neo;
            } else {
                this.thing.root = neo;
            }
            pv = neo;

            this.count ++;
        }
        neo.nx = this.thing.root;
        this.thing.root.pv = neo;

    },

    update: function() {
        if(this.count < this.num && this.mT % this.every == 1) {
            let fs = [
                {type:'loop', f:1/5},
                // {type:'smooth', f:0.1}
                {type:'local', f:2, from:2, reach:3},
                // {type:'push', f:{src:'t', cv:'pow', to:30, nd:29, pw:2, mn:1, mx:0 }, name:'centroid'}
                // {type:'outwards', f:{src:'t', cv:'pow', to:30, nd:29, pw:0.5, mn:1, mx:0 }, cw:true}
            ]

            // let dad = pick(this.thing.skin);
            let dad = this.dads[this.count % this.dads.length];
            this.thing.insertAfter(dad, {forces: fs});
            this.count ++;
            //this.findOpposites();
        }

        this.mT ++;
    }
}
scripts.push(scr);
