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

  MAXTIME = 180;
  WIDTH = 12;
  HEIGHT = 20;
  ROCKQTY = 10;
  DESTQTY = 3;
  DIR = ['Up', 'Right', 'Down', 'Left'];

  rover = {x:0, y:0, dir:0};
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

  ngOnInit() {

    this.timelapse();

    this.width = Array(this.WIDTH).fill(0).map((x,i)=>i);
    this.height = Array(this.HEIGHT).fill(0).map((x,i)=>i);
    this.rover.x = Math.floor(Math.random() * this.WIDTH);
    this.rover.y = Math.floor(Math.random() * this.HEIGHT);
    this.rover.dir = Math.floor(Math.random() * this.DIR.length);
    this.rock = Array(this.ROCKQTY).fill(0).map(x=>{
      return {
        x: Math.floor(Math.random() * this.WIDTH),
        y: Math.floor(Math.random() * this.HEIGHT)
      }
    });
    this.dest = Array(this.DESTQTY).fill(0).map(x=>{
      return {
        x: Math.floor(Math.random() * this.WIDTH),
        y: Math.floor(Math.random() * this.HEIGHT)
      }
    });
  }

  input(maneuver) {
    this.maneuver.push(maneuver);
    console.log(maneuver)
  }

  undo() {
    this.maneuver.pop();
  }

  send() {

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
