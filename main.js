	//////////////////////////////////////////////////////////////////////////////////
	//		Init
	//////////////////////////////////////////////////////////////////////////////////
	// init renderer
	var renderer	= new THREE.WebGLRenderer({
		antialias	: true,
		alpha: true
	});
	renderer.setClearColor(new THREE.Color('lightgrey'), 0)
	renderer.setSize( 640, 480 )
	renderer.domElement.style.position = 'absolute'
	renderer.domElement.style.top = '0px'
	renderer.domElement.style.left = '0px'
	document.body.appendChild( renderer.domElement )
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
		sourceType : 'webcam',
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
		camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() )
	})
	// update artoolkit on every frame
	onRenderFcts.push(function(){
		if( arToolkitSource.ready === false )	return
		arToolkitContext.update( arToolkitSource.domElement )
	})

	////////////////////////////////////////////////////////////////////////////////
	//          Create a ArMarkerControls
	////////////////////////////////////////////////////////////////////////////////

	var patternList = ["dollar", "sale", "euro",]
	var markerList = []
	
	for (var i = 0; i < 3; i++) {
		var markerRoot = new THREE.Group()
		scene.add(markerRoot)
		var markerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
			type : "pattern",
			patternUrl : "assets/pattern-" + patternList[i] + "-new.patt",
		})
		markerList.push(markerRoot)
	}

	//////////////////////////////////////////////////////////////////////////////////
	//		add an object in the scene
	//////////////////////////////////////////////////////////////////////////////////
	for(var i = 0; i < 3; i++){
	var geomatry = new THREE.PlaneGeometry(1.75,1.25,1.1);
	var material = new THREE.MeshBasicMaterial({ 
		color: 'rgb(255,255, 255)',
		side: THREE.DoubleSide
		});

	for(var i = 0; i < 3; i++){
	var plane = new THREE.Mesh(geomatry, material );
	markerList[i].add(plane)
	plane.rotation.x = Math.PI*0.5;
	}

	var dollarRoot = markerList[0]
	var saleRoot = markerList[1]
	var euroRoot = markerList[2]
	
	var dollar = new THREE.OBJLoader()
	dollar.load("assets/obey.obj", function (object) {
		object.scale.set(0.7,0.7,0.7)
		object.position.set(0, 0, 0)
		dollarRoot.add(object)
		})
	

	var sale = new THREE.OBJLoader()
	sale.load("assets/consume.obj", function (object) {
		object.scale.set(0.5,0.5,0.5)
		object.position.set(0, 0, 0)
		saleRoot.add(object)
		})

	var euro = new THREE.OBJLoader()
	euro.load("assets/thought.obj", function (object) {
		object.scale.set(0.5,0.5,0.5)
		object.position.set(0, 0, 0)
		euroRoot.add(object)
		})
	}

	//////////////////////////////////////////////////////////////////////////////////
	//		render the whole thing on the page
	//////////////////////////////////////////////////////////////////////////////////
	// render the scene
	onRenderFcts.push(function(){
		renderer.render( scene, camera )
	})
	// run the rendering loop
	var lastTimeMsec= null
	requestAnimationFrame(function animate(nowMsec){
		// keep looping
		requestAnimationFrame( animate )
		// measure time
		lastTimeMsec	= lastTimeMsec || nowMsec-1000/60
		var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec)
		lastTimeMsec	= nowMsec
		// call each update function
		onRenderFcts.forEach(function(onRenderFct){
			onRenderFct(deltaMsec/1000, nowMsec/1000)
		})
	})
