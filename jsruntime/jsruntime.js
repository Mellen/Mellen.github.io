(function()
 {
   const jslogo = new Image();
   const canvas = document.getElementById('canv');
   const ctx = canvas.getContext("2d");
   const width = canvas.clientWidth;
   const height = canvas.clientHeight;
   canvas.width = width;

   const JSY = 86;
   const START = 79;
   const FINISH = width-20-64-5;
   const DISTANCE = FINISH-START;
   const DELTA = DISTANCE / 1000;
   const oneMetre = DISTANCE / 20;

   function drawScene(jsx, jsy, angle, runtime)
   {
     ctx.clearRect(0, 0, width, height);
     
     ctx.fillStyle = "green";
     ctx.fillRect(0, 0, width, height);     
     
     let mili = Math.floor(runtime % 1000);
     let secs = (Math.floor(runtime/1000)%60).toString().padStart(2,'0');
     let mins = (Math.floor(runtime/60000)).toString().padStart(2,'0');

     ctx.lineWidth = 3;
     ctx.font = "20pt sans-serif";
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

   let starttime, endtime;
   let x = START;
   
   function animate(timestamp)
   {
     if (starttime === undefined)
     {
       starttime = timestamp;
     }
     endtime = timestamp;
     x += DELTA;

     const runtime = endtime - starttime;
     
     if(x < FINISH)
     {
       const angle = (2*Math.PI)*((x%oneMetre)/oneMetre);
       drawScene(x - jslogo.width/2, JSY, angle, runtime);
       requestAnimationFrame(animate);
     }
     else
     {
       gobtn.disabled = false;
     }
   }

   const gobtn = document.getElementById('btngo');
   gobtn.addEventListener('click', function(e)
   {
     x = START;
     starttime = undefined;
     gobtn.disabled = true;
     requestAnimationFrame(animate);
   });
     
 })();
