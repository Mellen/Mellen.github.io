(function()
 {
     const possibleAcids = ['a','g','c','t'];

     function Acid(letter, dist)
     {
         this.letter = letter;
         this.distanceFromOrigin = dist;
     }

     Acid.prototype.propagate = function()
     {
         let result = [];
         let x1 = 0;
         let y1 = 0;
         let x2 = 0;
         let y2 = 0;
         switch(this.letter)
         {
             case 'a':
             result.push(new Acid('t', {x:this.distanceFromOrigin.x, y:this.distanceFromOrigin.y-1}));
             x1 = this.distanceFromOrigin.x - 1;
             y1 = this.distanceFromOrigin.y;
             x2 = this.distanceFromOrigin.x + 1;
             y2 = this.distanceFromOrigin.y;
             break;
             case 'c':
             result.push(new Acid('g', {x:this.distanceFromOrigin.x-1, y:this.distanceFromOrigin.y}));
             x1 = this.distanceFromOrigin.x;
             y1 = this.distanceFromOrigin.y - 1;
             x2 = this.distanceFromOrigin.x;
             y2 = this.distanceFromOrigin.y + 1;
             break;
             case 'g':
             result.push(new Acid('c', {x:this.distanceFromOrigin.x+1, y:this.distanceFromOrigin.y}));
             x1 = this.distanceFromOrigin.x;
             y1 = this.distanceFromOrigin.y - 1;
             x2 = this.distanceFromOrigin.x;
             y2 = this.distanceFromOrigin.y + 1;
             break;
             case 't':
             result.push(new Acid('a', {x:this.distanceFromOrigin.x, y:this.distanceFromOrigin.y+1}));
             x1 = this.distanceFromOrigin.x - 1;
             y1 = this.distanceFromOrigin.y;
             x2 = this.distanceFromOrigin.x + 1;
             y2 = this.distanceFromOrigin.y;
             break;
         }

         result.push(this.randomAcid({x:x1, y:y1}), this.randomAcid({x:x2, y:y2}));
         
         return result;
     }

     Acid.prototype.randomAcid = function(dist)
     {
         let letter = possibleAcids[Math.floor(Math.random()*possibleAcids.length)];
         return new Acid(letter, dist);
     }

     function Soup()
     {
         let ta = new Acid();
         this.unplaced = [ta.randomAcid({x:0, y:0})]
     }

     Soup.prototype.cook = function*()
     {
         let used = [this.unplaced[0].distanceFromOrigin];
         while(this.unplaced.length > 0)
         {
             let acid = this.unplaced.shift();
             yield acid;
             let nexts = acid.propagate();
             for(let nextAcid of nexts)
             {
                 let curDist = nextAcid.distanceFromOrigin;
                 let found = false;
                 for(let dist of used)
                 {
                     if(curDist.x === dist.x && curDist.y === dist.y)
                     {
                         found = true;
                     }
                 }

                 if(!found)
                 {
                     this.unplaced.push(nextAcid);
                     used.push(nextAcid.distanceFromOrigin);
                 }
             }
         }

         return;
     }

     const canvas = document.getElementById('dna');
     const context = canvas.getContext('2d');

     const height = parseInt(canvas.getAttribute('height'), 10);
     const width = parseInt(canvas.getAttribute('width'), 10);
     const mid = {x:Math.floor(width/2), y:Math.floor(height/2)};

     const soup = new Soup();
     const soupChef = soup.cook();
     
     function draw(acid)
     {
         let imageData = context.getImageData(0,0,width,height);                  
         let position = {x:mid.x + acid.distanceFromOrigin.x, y:mid.y + acid.distanceFromOrigin.y};
         let pixelIndex = (position.x + (position.y * width))*4;
         let grey = 0;
         switch(acid.letter)
         {
             case 'a':
             grey = 32;
             break;
             case 'c':
             grey = 64;
             break;
             case 'g':
             grey = 96;
             break;
             case 't':
             grey = 128;
             break;
         }
         
         imageData.data[pixelIndex] = 32;
         imageData.data[pixelIndex+1] = grey;
         imageData.data[pixelIndex+2] = 32;
         imageData.data[pixelIndex+3] = 255;

         context.putImageData(imageData, 0, 0);
     }

     function step()
     {
         let acid_gen = soupChef.next();
         if(!acid_gen.done)
         {
             draw(acid_gen.value);
             requestAnimationFrame(step);
         }
         else
         {
             console.log('Done');
         }
     }

     requestAnimationFrame(step);
 })();
