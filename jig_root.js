const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const math = require('canvas-sketch-util/math');
//const Color = require('canvas-sketch-util/color')
//const risoColors = require('riso-colors');
const tweakpane = require('tweakpane');


// General canvas settings
const settings = {
      dimensions: [ 1080, 1080 ],
      animate: true,
};


// General Parameters
const genParams = {
      // Canvas
      width: 1080,
      height: 1080,
      marginXper: 0.1,
      marginYper: 0.1,
      // Background
      colour: '#CBD6E2',
      // Grid
      cols: 6,
      rows: 6,
      grid: true,
      snap: true,
      dots: true,
      points: true,
      // Index to select the current eleParams set
      ElementIndex: 0,
      flagEleChange: 0,
      flagGenChange: 0,
}

// Define default eleParams
const defaultEleParams = {
      order: null,
      cap: 'square',
      width: 100,
      colour: '#253342',
      angle: 'miter',
      border: 'solid',
      opacity: 1,
};
    
// Define multiple sets of eleParams with associated points arrays
const eleParamSets = [
      {
            eleParams: {
                  order: 1,
                  cap: 'round',
                  width: 50,
                  colour: '#FF5733',
                  angle: 'round',
                  border: 'dotted',
                  opacity: 0.7,
            },
            points: [], // Points array for the first set
      },
      {
            eleParams: {
                  order: 2,
                  cap: 'square',
                  width: 100,
                  colour: '#253342',
                  angle: 'miter',
                  border: 'solid',
                  opacity: 1,
            },
            points: [], // Points array for the second set
      },
      {
            eleParams: {
                  order: 3,
                  cap: 'square',
                  width: 100,
                  colour: '#253342',
                  angle: 'miter',
                  border: 'solid',
                  opacity: 1,
            },
            points: [], // Points array for the third set
      },
      {
            eleParams: {
                  order: 4,
                  cap: 'square',
                  width: 100,
                  colour: '#253342',
                  angle: 'miter',
                  border: 'solid',
                  opacity: 1,
            },
            points: [], // Points array for the forth set
      },
      // Add more sets as needed
];

// Reference to the Tweakpane instance
let pane = null; 
// initializing folders
let folderCanvas, folderBackground, folderGrid, folderElements, folderAesthetics = null;

// Declarations #2
let elCanvas; 
let numCells, gridWidth, gridHeight, cellWidth, cellHeight, marginX, marginY;

const sketch = ({ canvas, width, height }) => {

      // number of cells
      numCells = genParams.cols * genParams.rows;
      // grid
      gridWidth = width  * (1 - (2 * genParams.marginXper));
      gridHeight = height * (1 - (2 * genParams.marginYper));
      // cell
      cellWidth = gridWidth / genParams.cols;
      cellHeight = gridHeight / genParams.rows;
      // margin
      marginX = width * genParams.marginXper;
      marginY = width * genParams.marginYper;
      // start point
      startX = marginX + (cellWidth * 0.5);
      startY = marginY + (cellHeight * 0.5);

      // setting starter points
      for(let j = 0; j < eleParamSets.length; j ++){

            eleParamSets[genParams.ElementIndex + j].points = [
                  new Point({ x: startX, y: startY}),
            ];

      };

      canvas.addEventListener('mousedown', onMouseDown);

      elCanvas = canvas;

      return ({ context, width, height }) => {

            // recreating the tweakpane if current element changed
            if (genParams.flagEleChange == 1){

                  // Regenerate the aesthetics pane folder pane
                  folderAesthetics.dispose();
                  createPane();

                  genParams.flagEleChange = 0;
            }

            // recreating the background and grid if a general change occurs
            if (genParams.flagGenChange == 1){

                  // number of cells
                  numCells = genParams.cols * genParams.rows;
                  // grid
                  gridWidth = width  * (1 - (2 * genParams.marginXper));
                  gridHeight = height * (1 - (2 * genParams.marginYper));
                  // cell
                  cellWidth = gridWidth / genParams.cols;
                  cellHeight = gridHeight / genParams.rows;
                  // margin
                  marginX = width * genParams.marginXper;
                  marginY = width * genParams.marginYper;
                  // start point
                  startX = marginX + (cellWidth * 0.5);
                  startY = marginY + (cellHeight * 0.5);

                  genParams.flagGenChange = 0;
            }

            // background
            context.fillStyle = genParams.colour;
            context.fillRect(0, 0, genParams.width, genParams.height);

            // grid
            if (genParams.grid == true) { 
                  context.save();
                  context.strokeStyle = '#999';
                  context.lineWidth = 1;
                  
                  for (let i = 0; i < genParams.cols; i++) {
                        const x = i * cellWidth + startX;
                        context.beginPath();
                        context.moveTo(x, marginY);
                        context.lineTo(x, height - marginY);
                        context.stroke();
                  }
                  for (let i = 0; i < genParams.rows; i++) {
                        const y = i * cellHeight + startY;
                        context.beginPath();
                        context.moveTo(marginX, y);
                        context.lineTo(width - marginX, y);
                        context.stroke();
                  }

                  context.restore();
            }

            // dots
            if (genParams.dots == true) {
                  context.save();
                  context.fillStyle = 'black'; // Light grey color for dots
                  
                  for (let col = 0; col < genParams.cols; col++) {
                        for (let row = 0; row < genParams.rows; row++) {
                              const x = col * cellWidth + startX;
                              const y = row * cellHeight + startY;
                              context.beginPath();
                              context.arc(x, y, 3, 0, Math.PI * 2);
                              context.fill();
                        }
                  }

                  context.restore();
            }

            // printing all elements

            for (let j = 0; j < eleParamSets.length; j ++){
                  context.save();

                  // setting line params
                  context.lineWidth = eleParamSets[j].eleParams.width;
                  context.strokeStyle = eleParamSets[j].eleParams.colour;
                  context.lineCap = eleParamSets[j].eleParams.cap;
                  context.lineJoin  = eleParamSets[j].eleParams.angle;
                  context.beginPath();
      
                  context.moveTo(eleParamSets[j].points[0].x, eleParamSets[j].points[0].y);
      
                  for (let i = 1; i < eleParamSets[j].points.length; i ++){
                        context.lineTo(eleParamSets[j].points[i].x, eleParamSets[j].points[i].y);
                  }
                  context.stroke();
      
                  context.restore();
            }


            // ENABLE THIS CODE FOR CURVE INSIDE
            /*
            context.beginPath();
            context.moveTo(points[0].x, points[0].y);

            for (let i = 1; i < points.length; i += 2){
                  context.quadraticCurveTo(points[i].x, points[i].y, points[i+1].x, points[i+1].y);
            }
            context.stroke();
            */

            
            // context.beginPath();

            // for (let i = 0; i < eleParamSets[genParams.ElementIndex].points.length - 1; i ++){
            //       const curr = eleParamSets[genParams.ElementIndex].points[i];
            //       const next = eleParamSets[genParams.ElementIndex].points[i+1];

            //       const mx = curr.x + (next.x - curr.x) * 0.5;
            //       const my = curr.y + (next.y - curr.y) * 0.5;

            //       /*
            //       if (i == 0) { 
            //             context.moveTo(mx, my);
            //       } else {
            //             context.quadraticCurveTo(curr.x, curr.y, mx, my);
            //       }
            //       */

            //       /*
            //       if (i == 0) { 
            //             context.moveTo(curr.x, curr.y);
            //       } else if (i == points.length - 2) {
            //             context.quadraticCurveTo(curr.x, curr.y, next.x, next.y);
            //       } else {
            //             context.quadraticCurveTo(curr.x, curr.y, mx, my);
            //       }
            //       */

            // }

            /*
            // setting line params
            context.lineWidth = params.width;
            context.strokeStyle = params.colour;
            context.lineCap = params.cap;
            // draw the line
            context.stroke();
            */

            // points
            if (genParams.points == true) {
                  context.save();
                  eleParamSets[genParams.ElementIndex].points.forEach(point => {
                        point.draw(context);
                  });
                  context.restore();
            }
      };
};


const onMouseDown = (e) => {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);

      let x = Math.round((e.offsetX / elCanvas.offsetWidth) * elCanvas.width);
      let y = Math.round((e.offsetY / elCanvas.offsetHeight) * elCanvas.height);

      let hit = false;
      eleParamSets[genParams.ElementIndex].points.forEach(point => {
            point.isDragging = point.hitTest(x, y);
            if(!hit && point.isDragging) { 
                  hit = true;
            }
      });
 
      if (!hit) {
            if (genParams.snap == true) {
                  [x, y] = snapToGrid(x, y);
            }
            eleParamSets[genParams.ElementIndex].points.push(new Point({ x, y }));
      }
};

const onMouseMove = (e) => {
      // done to scale cursor location so that it varies from 0 to 1080 as per canvas dimesions
      let x = Math.round((e.offsetX / elCanvas.offsetWidth) * elCanvas.width);
      let y = Math.round((e.offsetY / elCanvas.offsetHeight) * elCanvas.height);
      
      eleParamSets[genParams.ElementIndex].points.forEach(point => {
            if (point.isDragging) {
                  if (genParams.snap == true) {
                        [x, y] = snapToGrid(x, y);
                  }
                  point.x = x;
                  point.y = y;
            }
      });
};

const onMouseUp = (e) => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
};

// Function to snap point inserted to grid
function snapToGrid(x, y) {
      const col = Math.floor((x - marginX) / cellWidth);
      const row = Math.floor((y - marginY) / cellHeight);
      const snappedX = col * cellWidth + cellWidth / 2 + marginX;
      const snappedY = row * cellHeight + cellHeight / 2 + marginY;
      
      return [snappedX, snappedY];
}

// Function 'bringToFront' moves the currently selected element to the highest order.
function bringToFront() {
      const currentIndex = genParams.ElementIndex;
      const lastIndex = eleParamSets.length - 1;
      if (currentIndex < lastIndex) {
            moveElement(currentIndex, lastIndex);
            genParams.ElementIndex = lastIndex; // Update genParams.ElementIndex
            genParams.flagEleChange = 1;
      }
}
    
// Function 'bringForward' moves the currently selected element one step to the front in the order.
function bringForward() {
      const currentIndex = genParams.ElementIndex;
      if (currentIndex < eleParamSets.length - 1) {
            moveElement(currentIndex, currentIndex + 1);
            genParams.ElementIndex++; // Update genParams.ElementIndex
            genParams.flagEleChange = 1;
      }
}

// Function 'sendBackward' moves the currently selected element one step to the back in the order.
function sendBackward() {
      const currentIndex = genParams.ElementIndex;
      if (currentIndex > 0) {
            moveElement(currentIndex, currentIndex - 1);
            genParams.ElementIndex--; // Update genParams.ElementIndex
            genParams.flagEleChange = 1;
      }
}
    
// Function 'sendToBack' moves the currently selected element to the lowest order.
function sendToBack() {
      const currentIndex = genParams.ElementIndex;
      if (currentIndex > 0) {
            moveElement(currentIndex, 0);
            genParams.ElementIndex = 0; // Update genParams.ElementIndex
            genParams.flagEleChange = 1;
      }
}
    
// Function 'moveElement' moves an element from one index to an other.
function moveElement(fromIndex, toIndex) {
      const element = eleParamSets.splice(fromIndex, 1)[0];
      eleParamSets.splice(toIndex, 0, element);
}

const createPane = () => {

      if (genParams.flagEleChange == 0){

            pane = new tweakpane.Pane({ title: 'JIG - Tool by Giljottina' });

            // pane.addSeparator();

            folderCanvas = pane.addFolder({ title: 'Canvas ' });
            folderCanvas.addInput(genParams, 'width', { min: 540, max: 2160, step: 10, disabled: true });
            folderCanvas.addInput(genParams, 'height', { min: 540, max: 2160, step: 10, disabled: true });
            folderCanvas.addInput(genParams, 'marginXper', { label: 'X margin', min: 0, max: 0.5, step: 0.01 })
                  .on('change', (ev) => {
                        genParams.flagGenChange = 1;
                  });   
            folderCanvas.addInput(genParams, 'marginYper', { label: 'Y margin', min: 0, max: 0.5, step: 0.01 })
                  .on('change', (ev) => {
                        genParams.flagGenChange = 1;
                  });   

            folderBackground = pane.addFolder({ title: 'Background ' });
            folderBackground.addInput(genParams, 'colour');
      
            folderGrid = pane.addFolder({ title: 'Grid ' });
            folderGrid.addInput(genParams, 'grid');
            folderGrid.addInput(genParams, 'snap');
            folderGrid.addInput(genParams, 'dots');
            folderGrid.addInput(genParams, 'points');
            folderGrid.addInput(genParams, 'cols', { label: 'columns', min: 2, max: 20, step: 1 })
                  .on('change', (ev) => {
                        genParams.flagGenChange = 1;
                  });            
            folderGrid.addInput(genParams, 'rows', { label: 'rows', min: 2, max: 20, step: 1 })
                  .on('change', (ev) => {
                        genParams.flagGenChange = 1;
                  });            

            folderElements = pane.addFolder({ title: 'Switch Elements' });
            folderElements.addInput(genParams, 'ElementIndex', { label: 'element', min: 0, max: eleParamSets.length - 1, step: 1 })
                  .on('change', (ev) => {
                        genParams.flagEleChange = 1;
                  });            
            folderElements.addButton({ title: 'Bring to Front'})
                  .on('click', () => {
                        bringToFront(); 
                        pane.refresh();
                  });
            folderElements.addButton({ title: 'Bring Forward'})
                  .on('click', () => {
                        bringForward();
                        pane.refresh();  
                  });
            folderElements.addButton({ title: 'Send Backward'})
                  .on('click', () => {
                        sendBackward();
                        pane.refresh();         
                  });
            folderElements.addButton({ title: 'Send to Back'})
                  .on('click', () => {
                        sendToBack();  
                        pane.refresh();   
                  });
      }

      folderAesthetics = pane.addFolder({ title: 'Element Aesthetics ' });
      folderAesthetics.addInput(eleParamSets[genParams.ElementIndex].eleParams, 'cap', { options: {butt: 'butt', round: 'round', square: 'square'}}); // would also like to find a way to do semi-cirle
      folderAesthetics.addInput(eleParamSets[genParams.ElementIndex].eleParams, 'width', { min: 10, max: 200, step: 10 });
      folderAesthetics.addInput(eleParamSets[genParams.ElementIndex].eleParams, 'colour');
      folderAesthetics.addInput(eleParamSets[genParams.ElementIndex].eleParams, 'angle', { options: {miter: 'miter', round: 'round', bevel: 'bevel'}});
      folderAesthetics.addInput(eleParamSets[genParams.ElementIndex].eleParams, 'border', { options: {solid: 'solid', dashed: 'dashed', dotted: 'dotted'}, disabled: true });
      folderAesthetics.addInput(eleParamSets[genParams.ElementIndex].eleParams, 'opacity', { min: 0, max: 1, step: 0.1, disabled: true });

      // pane.addSeparator();
      // pane.addButton({ title: 'Reset all settings to default'});
      // pane.addSeparator();
      // folderAbout = pane.addFolder({ title: 'created by Giljottina - 2023', expanded: false,});

};

// generate the tweakpane the first time
createPane();

canvasSketch(sketch, settings);

// creating the class for points
class Point {
      constructor({ x, y, control = false}) {
            this.x = x;
            this.y = y;
            this.control = control;
      }

      draw(context) {
            context.save();
            context.translate(this.x, this.y);
            context.fillStyle = this.control ? 'red' : 'black';

            context.beginPath();
            context.arc(0, 0, 10, 0, Math.PI * 2);
            context.fill();

            context.restore();
      }

      hitTest(x, y) {
            const dx = this.x - x;
            const dy = this.y - y;
            const dd = Math.sqrt(dx * dx + dy * dy);

            return dd < 20;
      } 
}