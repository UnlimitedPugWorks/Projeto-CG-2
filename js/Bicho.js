/*global THREE, requestAnimationFrame, console*/

var mainCamera, camera, camera2, camera3, scene, renderer;

var currentCannon, cannon_base, cannon_base2, cannon_base3;

var walls, cannon, cannon2, cannon3;

var rotateThisBall, canRotateBall = false, rotateBalls = [], followBall = false, ballWasFired = false, followedBall = -1;

var clock = new THREE.Clock();

var spheres = [], spheresDir = [];
var radius = 2, friction = 0.01;
var ballKeydown, dontWantAxes = false, wireframeOff = false, axesKeydown = false;

var cannonRotatingLeft = cannonRotatingRight = 0;

var cannonColors = {
	selected: [0xe58f22,0xd3d3d3],
	nonSelected: [0x8b5a1c,0x4b4545]
}



function createScene() {
  'use strict';
  scene = new THREE.Scene();
  scene.add(new THREE.AxesHelper(200));
}


function createWalls(){
	'use strict';
	walls = new THREE.Object3D();

	var geometry = new THREE.BoxGeometry(120, 10, 5);
	var geometry_2 = new THREE.BoxGeometry(5, 10, 120);
	var material = new THREE.MeshBasicMaterial({color: 0xb7e0df, side: THREE.DoubleSide});

	var wall = new THREE.Mesh(geometry, material);
	var wall2= new THREE.Mesh(geometry, material);
	var wall3= new THREE.Mesh(geometry_2, material);

	wall.position.set(60, 2.5, 2.5);
	wall2.position.set(60, 2.5, 127.5);
	wall3.position.set(2.5, 2.5, 65);

	walls.add(wall);
	walls.add(wall2);
	walls.add(wall3);

	scene.add(walls);

}


function createCannons(){
	'use strict';
	cannon = new THREE.Object3D();
	cannon2 = new THREE.Object3D();
	cannon3 = new THREE.Object3D();

	var geometry = new THREE.BoxGeometry(50, 3, 20);
	var geometry_2 = new THREE.CylinderGeometry(5, 2, 40, 32);
	var cannon_base_material = new THREE.MeshBasicMaterial({color: 0x8b5a1c, side: THREE.DoubleSide});
	var cannon_base_material2 = new THREE.MeshBasicMaterial({color: 0x8b5a1c, side: THREE.DoubleSide});
	var cannon_base_material3 = new THREE.MeshBasicMaterial({color: 0x8b5a1c, side: THREE.DoubleSide});

	var cannon_gun_material = new THREE.MeshBasicMaterial({color: 0x4b4545, side: THREE.DoubleSide});

	cannon_base = new THREE.Mesh(geometry, cannon_base_material);
	cannon_base2 = new THREE.Mesh(geometry, cannon_base_material2);
	cannon_base3 = new THREE.Mesh(geometry, cannon_base_material3);

	var gun = new THREE.Mesh(geometry_2, cannon_gun_material);
	var gun2 = new THREE.Mesh(geometry_2, cannon_gun_material);
	var gun3 = new THREE.Mesh(geometry_2, cannon_gun_material);

	gun.verticesNeedUpdate = true;
	gun2.verticesNeedUpdate = true;
	gun3.verticesNeedUpdate = true;

	gun.position.set(170, 5, 25);
	gun.rotateZ(-Math.PI/2);

	gun2.position.set(170, 5, 65);
	gun2.rotateZ(-Math.PI/2);

	gun3.position.set(170, 5, 105);
	gun3.rotateZ(-Math.PI/2);

	cannon_base.position.set(190, 0, 25);
	cannon_base2.position.set(190, 0, 65);
	cannon_base3.position.set(190, 0, 105);

	cannon.add(cannon_base);
	cannon.add(gun);

	cannon2.add(cannon_base2);
	cannon2.add(gun2);

	cannon3.add(cannon_base3);
	cannon3.add(gun3);

	scene.add(cannon);
	scene.add(cannon2);
	scene.add(cannon3);

	selectCannon(cannon);
}


function createCameras() {
	'use strict';

	//Calculus to fit all the scene in the canvas with a correct display
	var sceneHeight = 720*(1/5);
	var sceneWidth = 1380*(1/5);
	var aspectRatio = sceneWidth / sceneHeight;

	camera = new THREE.OrthographicCamera(- sceneWidth*aspectRatio / 2, sceneWidth*aspectRatio / 2, sceneHeight / 2, - sceneHeight / 2, -1000, 1000);
	camera2 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
	camera3 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

	camera.position.set(80, 30, 60);
	camera2.position.set(230, 100, 0);
	camera3.position.set(165, 15, 20);

	mainCamera = camera;
	mainCamera.lookAt(new THREE.Vector3(80, 10, 60));
}

function createRandomBalls(){

	'use strict';
	var i,ballnum=0, iscoll, k, obj, geometry, material, sphere, gun;
	var numBalls = THREE.Math.randInt(4,8);

	while(ballnum != numBalls){

		obj = new THREE.Object3D();
		geometry = new THREE.SphereGeometry( radius, 32, 32 );
		material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
		sphere = new THREE.Mesh( geometry, material );

		gun = currentCannon.children[1];
		obj.position.set(THREE.Math.randFloat(5+radius,120-radius),gun.position.y,THREE.Math.randFloat(5+radius,125-radius));
		obj.currentVector = new THREE.Vector2(0,0);
		obj.currentSpeed = 0;
		obj.mass = 1;

		obj.add(sphere);
		obj.add(new THREE.AxesHelper(3));

		iscoll=0;
		for(k = 0; k < spheres.length; k++){
			if(isCollision(obj, spheres[k])){
				iscoll=1;
				break;
			}
		}

		if(!iscoll){
			ballnum++;
			spheres.push(obj);
			scene.add(obj);
			iscoll=0;
		}
	}
}


function render() {
  'use strict';
  renderer.render(scene, mainCamera);
}


function init() {
  'use strict';
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  createScene();
  createWalls();
  createCannons();
  createCameras();
  createRandomBalls();
  render();

  window.addEventListener("keydown", onkeydown);
	window.addEventListener("keyup", onkeyup);
  window.addEventListener("resize", resizeWindow);
}


function animate() {
  'use strict';
  moveBalls();
  rotateCannon();
	rotateBall();
	followLastBall();
  render();
  requestAnimationFrame(animate);
}


function calculateCollision(obj1, obj2){
	'use strict';
  let M, m1, m2, v1, v2, firstComp1, firstComp2, v1X, v1Y, v2X, v2Y, pos1, pos2, offsetV1, offsetV2, offset;
  pos1 = new THREE.Vector2(obj1.position.x, obj1.position.z);
  pos2 = new THREE.Vector2(obj2.position.x, obj2.position.z);
  m1 = obj1.mass;
  m2 = obj2.mass;
  v1 = obj1.currentVector;
  v2 = obj2.currentVector;
  M = m1+m2;
  firstComp1 = (v1.dot(pos1)-v1.dot(pos2)-v2.dot(pos1)+v2.dot(pos2))/(pos1.dot(pos1)-pos1.dot(pos2)-pos2.dot(pos1)+pos2.dot(pos2));
  v1X=v1.x-(2*m2/M)*firstComp1*(pos1.x-pos2.x);
  v1Y=v1.y-(2*m2/M)*firstComp1*(pos1.y-pos2.y);
  firstComp2 = (v2.dot(pos2)-v2.dot(pos1)-v1.dot(pos2)+v1.dot(pos1))/(pos2.dot(pos2)-pos2.dot(pos1)-pos1.dot(pos2)+pos1.dot(pos1));
  v2X=v2.x-(2*m1/M)*firstComp2*(pos2.x-pos1.x);
  v2Y=v2.y-(2*m1/M)*firstComp2*(pos2.y-pos1.y);
  obj1.currentVector.x = v1X;
  obj1.currentVector.y = v1Y;
  obj2.currentVector.x = v2X;
  obj2.currentVector.y = v2Y;
  /*offset =  (2*radius  - pos1.distanceTo(pos2))/2;
  offsetV1 = obj1.currentVector.clone();
  offsetV2 = obj2.currentVector.clone();
  offsetV1.setLength(offset);
  offsetV2.setLength(offset);
  obj1.position.x += offsetV1.x
  obj1.position.z += offsetV1.y
  obj2.position.x += offsetV2.x
  obj2.position.z += offsetV2.y*/
  obj2.currentSpeed = obj2.currentVector.length();
  obj1.currentSpeed = obj1.currentVector.length();
}


function createBall(currentc){
	var obj = new THREE.Object3D();
	var geometry = new THREE.SphereGeometry(radius, 32, 32);
	var material = new THREE.MeshBasicMaterial({color: 0xffff00});
	var sphere = new THREE.Mesh(geometry, material);
	var gun = currentc.children[1];
	var axesHelper = new THREE.AxesHelper(3);

	obj.position.set(gun.position.x, gun.position.y, gun.position.z);
	var diretion = new THREE.Vector3();
	axesHelper.visible = !dontWantAxes;

	gun.getWorldDirection(diretion);
	diretion.applyAxisAngle( new THREE.Vector3(0,1,0), - Math.PI/2 );

	obj.currentVector = new THREE.Vector2(diretion.x, diretion.z);
	obj.currentSpeed = THREE.Math.randFloat(2,3);
	obj.mass = 1;
	obj.add(sphere);
	obj.add(axesHelper);
	scene.add(obj);
	spheres.push(obj);
}



function followLastBall(){
	'use strict';
	if(followBall && ballWasFired){
		var sphere = spheres[rotateThisBall];
		followedBall = rotateThisBall;
		if(sphere.currentSpeed != 0){
			mainCamera.position.x = sphere.position.x + 5;
			mainCamera.position.y = 7;
			mainCamera.position.z = sphere.position.z + 5;
			mainCamera.lookAt(sphere.position);
		}
	}
}


function isCollision(obj1,obj2){
	'use strict';
  var distanceX, distanceZ, distance;
  distanceX = obj2.position.x - obj1.position.x;
  distanceZ = obj2.position.z - obj1.position.z;
  distance = Math.sqrt(Math.pow(distanceX,2) + Math.pow(distanceZ,2));
  return distance <= 2*radius + 0.2;
}


function moveBalls(){
	'use strict';
    let i, j, k, l, m;

    for(i = 0; i < spheres.length-1; i++){
        for(j = i+1; j < spheres.length; j++){
            if(isCollision(spheres[i], spheres[j])){
                calculateCollision(spheres[i],spheres[j]);
            }
        }
    }

    for(k = 0; k < spheres.length; k++){
    	wallCollision(spheres[k]);
        spheres[k].position.x += spheres[k].currentVector.x;
        spheres[k].position.z += spheres[k].currentVector.y;
        if(spheres[k].currentSpeed > 0){
            spheres[k].currentSpeed -= friction;
            spheres[k].currentVector.setLength(spheres[k].currentSpeed);
        }
        if(spheres[k].currentSpeed < 0){
            spheres[k].currentSpeed = 0;
            spheres[k].currentVector.setLength(spheres[k].currentSpeed);
        }
    }
}


function resizeWindow() {
  'use strict';
  renderer.setSize(window.innerWidth, window.innerHeight);

  if (window.innerHeight > 0 && window.innerWidth > 0) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera2.aspect = window.innerWidth / window.innerHeight;
    camera3.aspect = window.innerWidth/ window.innerHeight;
  }
  	camera.updateProjectionMatrix();
	camera2.updateProjectionMatrix();
	camera3.updateProjectionMatrix();
}


function rotateBall(){
	'use strict';
	var i, sphere, spheresSpeedZero = 0;
	var delta = clock.getDelta();
	
	if(canRotateBall){
		for(i = 0; i < spheres.length; i++){
			sphere = spheres[i];
			if(sphere.currentSpeed != 0){
				sphere.rotateOnAxis(new THREE.Vector3(0, 0, 1), (Math.PI/16)*sphere.currentSpeed);
			}

			else{
				spheresSpeedZero++;
			}
		}
	}
	//With this flag, the function doesn't need to waste time with the for cycle
	if(spheresSpeedZero == spheres.length){
		canRotateBall = false;
	}
}


function rotateCannon(){
	'use strict';
	if(currentCannon != null){

		var gun;
		var delta = clock.getDelta();

		gun = currentCannon.children[1];

		gun.rotation.y += cannonRotatingLeft ? (Math.PI/2)*delta : 0;
		cannonRotatingLeft = 0;

		gun.rotation.y -= cannonRotatingRight ? (Math.PI/2)*delta : 0;
		cannonRotatingRight = 0;

	}
}


function selectCannon(cannonx){
	'use strict';
	if(currentCannon != null){
		var childs = currentCannon.children;

		childs[0].material.color.set(cannonColors["nonSelected"][0]);
		childs[1].material.color.set(cannonColors["nonSelected"][1]);
	}

	currentCannon = cannonx;

	childs = currentCannon.children;

	childs[0].material.color.set(cannonColors["selected"][0]);
	childs[1].material.color.set(cannonColors["selected"][1]);
}


function wallCollision(obj){
	'use strict';

	if((obj.position.x < 120 + radius) && (obj.position.z > 0 && obj.position.z < 5)){
		obj.currentVector.x = obj.currentVector.x * -1;	
	}

	if((obj.position.x < 120 + radius) && (obj.position.z > 125 && obj.position.z < 130)){
		obj.currentVector.x = obj.currentVector.x * -1;

	}

	if((obj.position.x > 0 && obj.position.x < 120+radius) && (obj.position.z > 5 && obj.position.z < 5 + radius)){
		obj.currentVector.y = obj.currentVector.y * -1;
	}

	if((obj.position.x > 0 && obj.position.x < 120+radius) && (obj.position.z > 125 - radius && obj.position.z < 125)){
		obj.currentVector.y = obj.currentVector.y * -1;
	}

	if((obj.position.x < 5+radius ) && (obj.position.z >5+radius && obj.position.z < 122.5 +radius)){
		obj.currentVector.x = obj.currentVector.x * -1;
	}
}


onkeydown = onkeyup = function(e) {
  switch (e.keyCode) {
	  case 37:	//Left Arrow Key
			cannonRotatingLeft = 1;
			break;

	  case 39:	//Right Arrow Key
			cannonRotatingRight = 1;
			break;

	  case 32: 	//Space Key
	  	if (e.type == 'keydown' && !ballKeydown){
				createBall(currentCannon);
				canRotateBall = true;
				ballWasFired = true;
				rotateThisBall = spheres.length - 1;
				rotateBalls.push(rotateThisBall);
				ballKeydown = true;
			}

			if(e.type == 'keyup' && ballKeydown){
				ballKeydown = false;
			}

			break;

	  case 49:	//1 Key
			camera.position.set(80, 30, 60);
			mainCamera = camera;
			mainCamera.lookAt(new THREE.Vector3(80, 10, 60));
			followBall = false;
	    break;

	  case 50:	//2 Key
			camera2.position.set(230, 100, 0);
			mainCamera = camera2;
			mainCamera.lookAt(new THREE.Vector3(220, 0, 65));
			followBall = false;
	    break;

	  case 51:	//3 Key
			mainCamera = camera3;
			if(ballWasFired && followedBall != -1){
				mainCamera.lookAt(spheres[followedBall].position);
			}

			else{
				mainCamera.lookAt(new THREE.Vector3(50, 7, 50));
			}

			followBall = true;
	    break;

	  case 52:	//4 Key
			if(e.type == "keydown" && !wireframeOff){
			  scene.traverse(function (node) {
			    if (node instanceof THREE.Mesh) {
			      node.material.wireframe = !node.material.wireframe;
			    }
			  });
				wireframeOff = true;
			}

			if(e.type == "keyup" && wireframeOff){
				wireframeOff = false;
			}

		  break;

		case 81: 	//q,Q Key
			selectCannon(cannon);
			break;

		case 87: 	//w,W Key
			selectCannon(cannon2);
			break;

	  case 69:  //e,E Key;
			selectCannon(cannon3);
	    break;

	 	case 82:	//r,R Key
			if(e.type == "keydown" && !axesKeydown){
				for(i = 0; i < spheres.length; i++){
					spheres[i].traverse(function (node){
						if(node instanceof THREE.AxesHelper){
							node.visible = !node.visible;
						}
					});
				}
				dontWantAxes = !dontWantAxes;
				axesKeydown = true;
			}

			if(e.type == "keyup" && axesKeydown){
				axesKeydown = false;
			}
	 		break;
	}
}
