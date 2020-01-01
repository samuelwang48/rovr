import * as PF from 'pathfinding';
import { Component, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { faArrowUp,
         faArrowRight,
         faArrowDown,
         faArrowLeft,
         faArrowAltCircleUp,
         faArrowAltCircleRight,
         faArrowAltCircleLeft,
         faSatelliteDish,
         faExclamationTriangle,
         faStar,
         faCaretUp,
         faCaretRight,
         faCaretLeft,
         faBackspace,
         faUndo,
         faRedo,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-sandbox',
  templateUrl: './sandbox.component.html',
  styleUrls: ['./sandbox.component.scss']
})
export class SandboxComponent implements OnInit {
  @ViewChild('monarea') monArea: ElementRef;
  @ViewChild('maparea') mapArea: ElementRef;
  @ViewChild('ctrlarea') ctrlArea: ElementRef;

  icoArrowUp = faArrowUp;
  icoArrowRight = faArrowRight;
  icoArrowDown = faArrowDown;
  icoArrowLeft = faArrowLeft;
  icoMoveForward = faArrowAltCircleUp;
  icoTurnRight = faArrowAltCircleRight;
  icoTurnLeft = faArrowAltCircleLeft;
  icoInsMoveForward = faCaretUp;
  icoInsTurnRight = faRedo;
  icoInsTurnLeft = faUndo;
  icoUndo = faBackspace;
  icoSend = faSatelliteDish;
  icoRock = faExclamationTriangle;
  icoStar = faStar;

  FPS = 5;// per second = 1000/FPS
  MAXTIME = 120;
  WIDTH = 12;
  HEIGHT = 15;
  ROCKQTY = 40;
  DESTQTY = 5;
  DIR = ['Up', 'Right', 'Down', 'Left'];

  rover = {x: -1, y: -1, dir: -1};
  rock = [];
  dest = [];
  width = [];
  height = [];
  maneuver = [];
  timespent = 0;
  timeleftStyle = {};
  timeleftMins = 0;
  timeleftSecs = 0;
  timer = null;
  maneuvingTimer = null;
  notimeBg = null;

  constructor(private sanitizer: DomSanitizer) { }

  timelapse() {
    this.timer = setInterval( f => {
      const timeleft = this.MAXTIME - this.timespent;
      const timeleftRatio = timeleft/this.MAXTIME;
      if (timeleftRatio <= 0.3) {
        this.notimeBg = this.sanitizer.bypassSecurityTrustStyle('red');
      } else {
        this.notimeBg = this.sanitizer.bypassSecurityTrustStyle('white');
      }
      if (timeleft === 0) {
        clearTimeout(this.timer);
      }
      this.timeleftMins = Math.floor(timeleft/60);
      this.timeleftSecs = timeleft % 60;
      this.timeleftStyle = this.sanitizer.bypassSecurityTrustStyle(
        timeleftRatio*100+'%'
      );
      this.timespent += 1;
    }, 1000);
  }

  genMap() {

    const allX = Array(this.WIDTH).fill(0).map((el, i)=>i);
    const allY = Array(this.HEIGHT).fill(0).map((el, i)=>i);
    const allCord = [];
    const grid = [];

    allY.forEach(y=>{
      const row = [];
      allX.forEach(x=>{
        allCord.push({x: x, y: y});
        row.push(0);
      });
      grid.push(row);
    });

    this.rock = Array(this.ROCKQTY).fill(0).map(rock => {
      const ri = Math.floor(Math.random() * allCord.length);
      rock = allCord[ri];
      allCord.splice(ri, 1);
      grid[rock.y][rock.x] = 1;
      return rock;
    });

    this.dest = Array(this.DESTQTY).fill(0).map(dest=>{
      const ri = Math.floor(Math.random() * allCord.length);
      dest = allCord[ri];
      allCord.splice(ri, 1);
      return dest;
    });

    this.rover = Array(1).fill(0).map(r=>{
      const ri = Math.floor(Math.random() * allCord.length);
      const rover = allCord[ri];
      allCord.splice(ri, 1);
      return rover;
    })[0];

    this.rover.dir = Math.floor(Math.random() * this.DIR.length);

    const start = [this.rover.x, this.rover.y];
    const finder = new PF.BestFirstFinder({
        allowDiagonal: false
    });
    
    // console.log(grid);

    const walkable = [];
    this.dest.map(d=>[d.x, d.y]).forEach(end => {
      const pfGrid = new PF.Grid(grid);
      const path = finder.findPath(...start, ...end, pfGrid);
      walkable.push(path);
      // console.log('find', ...start, ...end);
      // console.log('path', path);
    });

    console.log(walkable.map(w=>w.length));
    if (walkable.map(w=>w.length).indexOf(0) > -1) {
      this.wipe();
      console.log('recalculate map');
      this.genMap();
    }
  }

  wipe() {
    this.rock = [];
    this.dest = [];
    this.rover = {x: -1, y: -1, dir: -1};
  }

  ngOnInit() {
    this.timelapse();
    this.width = Array(this.WIDTH).fill(0).map((x,i)=>i);
    this.height = Array(this.HEIGHT).fill(0).map((x,i)=>i);
    this.genMap();
  }

  input(maneuver) {
    this.maneuver.push(maneuver);
    console.log(maneuver)
  }

  undo() {
    this.maneuver.pop();
  }

  send() {
    const dd = this.DIR;
    const dl = dd.length;

    this.maneuver.forEach((m, i)=>{
      this.maneuvingTimer = setTimeout(t => {
        const di = this.rover.dir;
        const dir = dd[di];
        const x = this.rover.x;
        const y = this.rover.y;

        //console.log(m, i, dir, this.rover);

        if (m === 'Left') {
          this.rover.dir = (dd.indexOf(dir) + dl - 1) % dl;
        }
        if (m === 'Right') {
          this.rover.dir = (dd.indexOf(dir) + 1) % dl;
        }
        else if (m === 'Forward') {
          if (dir === 'Up') {
            const dy = y - 1;
            this.move(x, dy, f=>{ this.rover.y = dy; });
          }
          else if (dir === 'Right') {
            const dx = x + 1;
            this.move(dx, y, f=>{ this.rover.x = dx; });
          }
          else if (dir === 'Down') {
            const dy = y + 1;
            this.move(x, dy, f=>{ this.rover.y = dy; });
          }
          else if (dir === 'Left') {
            const dx = x - 1;
            this.move(dx, y, f=>{ this.rover.x = dx; });
          }
        }
      }, 1000/this.FPS*i);
      this.maneuver = [];
    });

  }

  move(x, y, f) {
    if ( x < 0 || y < 0 || x >= this.WIDTH || y >= this.HEIGHT ) {
      clearTimeout(this.maneuvingTimer);
      alert('Out of map!');
    } else {
      // hitting rocks
      if (this.rock.find( r => r.x === x && r.y === y )) {
        clearTimeout(this.maneuvingTimer);
        alert('Hitting Rock!');
      } else {
        // hitting stars
        const star = this.dest.find( r => r.x === x && r.y === y );
        if (star) {
          star.x = -1;
          star.y = -1;
          this.dest.sort((a,b) => (a.x > b.x) ? 1 : ((b.x > a.x) ? -1 : 0));
        }
        f.apply(this);
      }
    }
  }

  ngAfterViewInit() {
    setTimeout( f=> {
      const monareaHeight = this.monArea.nativeElement.offsetHeight;
      const ctrlareaHeight = this.ctrlArea.nativeElement.offsetHeight;
      const height = window.innerHeight - monareaHeight - ctrlareaHeight;
      this.mapArea.nativeElement.style.height = height + 'px';
    }, 500);
  }
}
