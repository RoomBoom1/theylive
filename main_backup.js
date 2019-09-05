	//////////////////////////////////////////////////////////////////////////////////
	//		Init
	//////////////////////////////////////////////////////////////////////////////////



	// init renderer
	var renderer	= new THREE.WebGLRenderer({
		antialias: true,
		alpha: true
	});
	renderer.setClearColor(new THREE.Color('lightgrey'), 0)
	renderer.setSize( 640, 480 );
	renderer.domElement.style.position = 'absolute'
	renderer.domElement.style.top = '0px'
	renderer.domElement.style.left = '0px'
	document.body.appendChild( renderer.domElement );

	// array of functions for the rendering loop
	var onRenderFcts= [];

	// init scene and camera
	var scene	= new THREE.Scene();

	//////////////////////////////////////////////////////////////////////////////////
	//		Initialize a basic camera
	//////////////////////////////////////////////////////////////////////////////////

	// Create a camera
	var camera = new THREE.Camera();
	scene.add(camera);

	////////////////////////////////////////////////////////////////////////////////
	//          handle arToolkitSource
	////////////////////////////////////////////////////////////////////////////////

	var arToolkitSource = new THREEx.ArToolkitSource({
		// to read from the webcam
		sourceType : 'webcam',

	// resolution of at which we initialize the source image
	sourceWidth: 640,
	sourceHeight: 480,
	// resolution displayed for the source 
	displayWidth: 640,
	displayHeight: 480,

		})

	arToolkitSource.init(function onReady(){
		onResize()
	})

	// handle resize
	window.addEventListener('resize', function(){
		onResize()
	})
	function onResize(){
		arToolkitSource.onResizeElement()
		arToolkitSource.copyElementSizeTo(renderer.domElement)
		if( arToolkitContext.arController !== null ){
			arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)
		}
	}
	////////////////////////////////////////////////////////////////////////////////
	//          initialize arToolkitContext
	////////////////////////////////////////////////////////////////////////////////


	// create atToolkitContext
	var arToolkitContext = new THREEx.ArToolkitContext({
		cameraParametersUrl: THREEx.ArToolkitContext.baseURL + '/data/data/camera_para.dat',
		detectionMode: 'mono',
		patternRatio: 0.9,
	})
	// initialize it
	arToolkitContext.init(function onCompleted(){
		// copy projection matrix to camera
		camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
	})

	// update artoolkit on every frame
	onRenderFcts.push(function(){
		if( arToolkitSource.ready === false )	return

		arToolkitContext.update( arToolkitSource.domElement )

		// update scene.visible if the marker is seen
	//	scene.visible = camera.visible
	})
	////////////////////////////////////////////////////////////////////////////////
	//          Create  ArMarkerControls
	////////////////////////////////////////////////////////////////////////////////
/*
	// init controls for camera
	var markerControls = new THREEx.ArMarkerControls(arToolkitContext, camera, {
		type : 'pattern',
		//patternUrl : THREEx.ArToolkitContext.baseURL + '/data/data/patt.hiro',
		patternUrl : "/assets/pattern-sale-new.patt",
		// as we controls the camera, set changeMatrixMode: 'cameraTransformMatrix'
		changeMatrixMode: 'cameraTransformMatrix'
	})
*/
	var patternList = ["dollar", "sale", "euro",]
	var markerList = []
	
	for (var i = 0; i < 3; i++) {
		var markerRoot = new THREE.Group()
		scene.add(markerRoot)
		var markerControls = new THREEx.ArMarkerControls(arToolkitContext, camera, {
			type : "pattern",
			patternUrl : "/assets/pattern-" + patternList[i] + "-new.patt",
	//		changeMatrixMode: 'cameraTransformMatrix'
		})
		markerList.push(markerRoot)
	}

	// as we do changeMatrixMode: 'cameraTransformMatrix', start with invisible scene
//	scene.visible = false

	////////////////////////////////////////////////////////////////
	//		add an object in the scene
	//////////////////////////////////////////////////////////////////////////////////
/*
	// add a torus knot
	var geometry	= new THREE.CubeGeometry(1,1,1);
	var material	= new THREE.MeshNormalMaterial({
		transparent : true,
		opacity: 0.5,
		side: THREE.DoubleSide
	});
	var mesh	= new THREE.Mesh( geometry, material );
	mesh.position.y	= geometry.parameters.height/2
	scene.add( mesh );

	var geometry	= new THREE.TorusKnotGeometry(0.3,0.1,64,16);
	var material	= new THREE.MeshNormalMaterial();
	var mesh	= new THREE.Mesh( geometry, material );
	mesh.position.y	= 0.5
	scene.add( mesh );

	onRenderFcts.push(function(delta){
		mesh.rotation.x += Math.PI*delta
	})
*/
	var geomatry = new THREE.PlaneGeometry(1.1,1.1,1.1);
	var material = new THREE.MeshBasicMaterial({ 
		color: 'rgb(255,255, 255)',
		side: THREE.DoubleSide
		});

	for(var i = 0; i < 3; i++){
	var plane = new THREE.Mesh(geomatry, material );
	markerList[i].add(plane)
	plane.rotation.x = Math.PI*0.5;
	var loader = new THREE.OBJLoader();
/*	
	loader.load("assets/consume.obj", function (object) {
		object.scale.set(0.5,0.5,0.5);
		object.position.set(0, 0, 0);
		markerList[i].add(object)
	});
	*/
	}

	


	//////////////////////////////////////////////////////////////////////////////////
	//		render the whole thing on the page
	//////////////////////////////////////////////////////////////////////////////////

	// render the scene
	onRenderFcts.push(function(){
		renderer.render( scene, camera );
	})

	// run the rendering loop
	var lastTimeMsec= null
	requestAnimationFrame(function animate(nowMsec){
		// keep looping
		requestAnimationFrame( animate );
		// measure time
		lastTimeMsec	= lastTimeMsec || nowMsec-1000/60
		var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec)
		lastTimeMsec	= nowMsec
		// call each update function
		onRenderFcts.forEach(function(onRenderFct){
			onRenderFct(deltaMsec/1000, nowMsec/1000)
		})
	})
