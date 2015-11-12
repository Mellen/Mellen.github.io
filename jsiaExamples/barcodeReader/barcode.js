(function()
 {
     var canvas = document.getElementById('canvas');
     var ctx = canvas.getContext('2d');

     var vid = document.getElementById('vid');
     var localMediaStream = null;

     navigator.getUserMedia = ( navigator.getUserMedia ||
				navigator.webkitGetUserMedia ||
				navigator.mozGetUserMedia ||
				navigator.msGetUserMedia);

     if(navigator.getUserMedia)
     {
	 var um = navigator.getUserMedia({video: true}, handleVid, vidErr);
     }

     function handleVid(stream)
     {
	 vid.src = window.URL.createObjectURL(stream);
	 localMediaStream = stream;
     }

     function vidErr(e)
     {
	 alert(e);
     }

     function capture()
     {
	 if(localMediaStream)
	 {
	     canvas.width = vid.clientWidth;
	     canvas.height = vid.clientHeight;
	     
	     ctx.drawImage(vid, 0, 0);
	 }
     }

     setInterval(capture, 10);
 })();