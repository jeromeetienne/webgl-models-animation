var width = window.innerWidth;
var height = window.innerHeight;

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

var scene = new THREE.Scene;


var loader = new THREE.JSONLoader();
var animation;
var skinnedMesh, pivot, item;
loader.load('./model.js', function (geometry, materials) {
	skinnedMesh = new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial(materials));
	skinnedMesh.position.y = 50;
	skinnedMesh.scale.set(15, 15, 15);
	scene.add(skinnedMesh);

	item = new THREE.Mesh(new THREE.CubeGeometry(100, 10, 10), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
	item.position.x = 50;
	pivot = new THREE.Object3D();
	pivot.scale.set(.15, .15, .15);
	pivot.add(item);
	pivot.useQuaternion = true;
	skinnedMesh.add(pivot);

	animate(skinnedMesh);
});

function animate(skinnedMesh) {
	var materials = skinnedMesh.material.materials;

	for (var k in materials) {
		materials[k].skinning = true;
	}

	THREE.AnimationHandler.add(skinnedMesh.geometry.animation);
	animation = new THREE.Animation(skinnedMesh, "ArmatureAction", THREE.AnimationHandler.CATMULLROM);
	animation.play(false, 0);
}

var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
camera.position.y = 160;
camera.position.z = 400;
camera.lookAt(new THREE.Vector3(0,0,0));

scene.add(camera);

var pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(0, 300, 200);

scene.add(pointLight);

var clock = new THREE.Clock;
var currentSequence = 'standing';

function render() {
	requestAnimationFrame(render);

	var delta = clock.getDelta();

	if( skinnedMesh ){
		pivot.position = new THREE.Vector3().getPositionFromMatrix(skinnedMesh.bones[2].skinMatrix);
		pivot.quaternion.setFromRotationMatrix(skinnedMesh.bones[2].skinMatrix);
	}

	if (animation){
		animation.update(delta);
		if ( currentSequence == 'standing') {
			if (animation.currentTime > 4) {
				animation.stop();
				animation.play(false, 0); // play the animation not looped, from 0s
			}
		} else if (currentSequence == 'walking') {
			if (animation.currentTime <= 4 || animation.currentTime > 8) {
				animation.stop();
				animation.play(false, 4); // play the animation not looped, from 3s
			}
		}
	}


	renderer.render(scene, camera);
}

document.addEventListener('keyup', function (e) {
	if (e.keyCode == 'A'.charCodeAt(0)) {
		currentSequence = (currentSequence == 'standing' ? 'walking': 'standing');
		console.log('currentSequence', currentSequence)
	}
});

render();
