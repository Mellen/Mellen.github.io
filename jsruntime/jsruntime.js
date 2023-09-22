(function()
 {
   const jslogo = new Image();
   const canvas = document.getElementById('canv');
   const ctx = canvas.getContext("2d");
   let width = canvas.clientWidth;
   const height = canvas.clientHeight;
   canvas.width = width;

   const JSY = 86;
   const START = 79;
   let FINISH = width-20-64-5;
   let DISTANCE = FINISH-START;
   let DELTA = DISTANCE / 500;
   let oneMetre = DISTANCE / 10;

   function drawScene(jsx, jsy, angle, runtime)
   {
     ctx.clearRect(0, 0, width, height);
     
     ctx.fillStyle = "green";
     ctx.fillRect(0, 0, width, height);     
     
     let mili = Math.floor(runtime % 1000);
     let secs = (Math.floor(runtime/1000)%60).toString().padStart(2,'0');
     let mins = (Math.floor(runtime/60000)).toString().padStart(2,'0');

     ctx.lineWidth = 3;
     ctx.font = "20pt mono";
     ctx.strokeText(`${mins}:${secs}.${mili}`, 128, 30);
     
     ctx.fillStyle = "white";
     ctx.fillRect(START, 0, 10, height);    

     ctx.fillStyle = "white";
     ctx.fillRect(FINISH, 0, 10, height);

     const legStartX = jsx + jslogo.width/2;
     const legStartY = jsy + jslogo.height/2;
     const legEndX = legStartX + (jslogo.width)*Math.cos(angle);
     const legEndY = legStartY + (jslogo.width)*Math.sin(angle);
     const footEndX = legEndX + (jslogo.width/4)*Math.cos(angle - Math.PI/2);
     const footEndY = legEndY + (jslogo.width/4)*Math.sin(angle - Math.PI/2);

     const backLegEndX = legStartX + (jslogo.width)*Math.cos(angle - Math.PI);
     const backLegEndY = legStartY + (jslogo.width)*Math.sin(angle - Math.PI);
     const backFootEndX = backLegEndX + (jslogo.width/4)*Math.cos(angle + Math.PI/2);
     const backFootEndY = backLegEndY + (jslogo.width/4)*Math.sin(angle + Math.PI/2);

     ctx.lineWidth = 5;
     
     ctx.beginPath();
     ctx.moveTo(legStartX, legStartY);
     ctx.lineTo(backLegEndX, backLegEndY);
     ctx.lineTo(backFootEndX, backFootEndY);
     ctx.stroke();
     
     ctx.drawImage(jslogo, jsx, jsy);

     ctx.beginPath();
     ctx.moveTo(legStartX, legStartY);
     ctx.lineTo(legEndX, legEndY);
     ctx.lineTo(footEndX, footEndY);
     ctx.stroke();
   }
   
   jslogo.onload = function(e)
   {
     drawScene(START - jslogo.width/2, JSY, Math.PI/2, 0);
   };

   jslogo.src = 'img/js.jpg';

   let starttime, endtime, lasttime, runtime;
   let x = START;
   let doingconfetti = false;
   let confCount = 64;

   let confPoints = new Array(confCount);
   const colours = ['red', 'yellow', 'blue', 'white'];
   
   function animateConfetti(timestamp)
   {
     if(lasttime === undefined)
     {
       lasttime = timestamp;
     }

     let deltaT = timestamp - lasttime;
     const G = 9.8;
     const airResistance = 5;
     
     if(deltaT > 50)
     {
       deltaT = deltaT/100;
       let angle = (2*Math.PI)*((x%oneMetre)/oneMetre);
       drawScene(x - jslogo.width/2, JSY, angle, runtime);
       
       lasttime = timestamp;
       let stop = 0;
       for(let point of confPoints)
       {
         let dx = point.vx * deltaT;
         let dy = point.vy * deltaT;
         point.y -= dy;
         let hitground = false;
         if(point.y >= height-5)
         {
           point.y = height-5;
           stop++;
           hitground = true;
         }

         if(!hitground)
         {
           point.x -= dx;
         }

         ctx.fillStyle = point.colour;
         ctx.fillRect(point.x, point.y, 5, 5);
         
         point.vy -= G * deltaT;
         
         if(point.vx > 0)
         {
           point.vx -= airResistance * deltaT;
         }
         else
         {
           point.vx = 0;
         }
         
       }

       console.log('stop', stop);

       if(stop >= confCount)
       {
         doingconfetti = false;
       }
     }
     
     if(doingconfetti)
     {
       lasttime
       requestAnimationFrame(animateConfetti);
     }
   }
   
   
   function animate(timestamp)
   {
     if (starttime === undefined)
     {
       starttime = timestamp;
     }
     endtime = timestamp;
     x += DELTA;

     runtime = endtime - starttime;
     
     if(x < FINISH)
     {
       const angle = (2*Math.PI)*((x%oneMetre)/oneMetre);
       drawScene(x - jslogo.width/2, JSY, angle, runtime);
       requestAnimationFrame(animate);
     }
     else
     {
       doingconfetti = true
       gobtn.disabled = false;
       lasttime = undefined;
       confPoints = confPoints.fill(0).map(_ => {return {x: FINISH+2.5,
                                                         y:(JSY-jslogo.width/2)-5,
                                                         vx:100*Math.random(),
                                                         vy:100*Math.random(),
                                                         colour: colours[Math.floor(Math.random()*colours.length)]}});

       requestAnimationFrame(animateConfetti);
     }
   }

   const gobtn = document.getElementById('btngo');
   gobtn.addEventListener('click', function(e)
   {
     width = canvas.clientWidth;
     canvas.width = width;
     FINISH = width-20-64-5;
     DISTANCE = FINISH-START;
     DELTA = DISTANCE / 500;
     oneMetre = DISTANCE / 10;

     x = START;
     starttime = undefined;
     runtime = 0;
     gobtn.disabled = true;
     doingconfetti = false;
     requestAnimationFrame(animate);
   });
     
 })();
