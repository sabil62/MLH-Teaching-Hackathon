
import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { XRHandModelFactory } from 'three/examples/jsm/webxr/XRHandModelFactory.js';

const tmpVector1 = new THREE.Vector3();
const tmpVector2 = new THREE.Vector3();

let App = class App {
    constructor() {
        const container = document.createElement('div');
        document.body.appendChild(container);

        /*Creating Camera, Scene and Renderer */
        this.camera = this.createCamera();
        this.scene = this.createScene();
        this.renderer = this.createRenderer();
        container.appendChild(this.renderer.domElement);

        // Adding Lights
        this.addLight();

        const room = new THREE.LineSegments(
            new BoxLineGeometry(6, 6, 6, 10, 10, 10),
            new THREE.LineBasicMaterial({
                color: "#151515",
            })
        );
        room.geometry.translate(0, 3, 0);
        this.scene.add(room);

        this.addColors();
        this.drawColor = 0xfdffbf

        this.controls = new OrbitControls(this.camera, container);
        this.controls.target.set(0, 1.6, 0);
        this.controls.update();

        this.session;
        this.renderer.xr.addEventListener("sessionstart", (event) => {
            this.session = this.renderer.xr.getSession();
        });
        this.renderer.xr.addEventListener("sessionend", (event) => {
            this.session = null;
        });

        // Build Hands
        this.rightHand;
        this.leftHand;
        this.buildHands(0); // Right Hand
        this.buildHands(1); // Left Hand


        this.setupVR();
        this.renderer.setAnimationLoop(this.render.bind(this));
        window.addEventListener('resize', this.resize.bind(this));

    }

    buildHands(thehand){
        let controller;
        let controllerGrip;

        /*Initialising controllerModelFactory and handModelFactory from Three.js */
        const controllerModelFactory = new XRControllerModelFactory();
        const handModelFactory = new XRHandModelFactory().setPath(
            "../hand-models"
        );
        /* Setting up Hand from POV */
        controller = this.renderer.xr.getController(thehand);
        this.scene.add(controller);
        controllerGrip = this.renderer.xr.getControllerGrip(thehand);
        controllerGrip.add(controllerModelFactory.createControllerModel(controllerGrip));
        this.scene.add(controllerGrip);
        if (thehand == 0){
            this.rightHand = this.renderer.xr.getHand(0);
            this.rightHand.add(handModelFactory.createHandModel(this.rightHand));
            this.scene.add(this.rightHand);
        }
        else{
            this.leftHand = this.renderer.xr.getHand(1);
            this.leftHand.add(handModelFactory.createHandModel(this.leftHand));
            this.scene.add(this.leftHand);
        }
    }

    getHandVisibilityStatus() {
        if (this.session) {
            for (const inputSource of this.session.inputSources) {
                if (inputSource.hand) {
                    let name = inputSource.handedness;
                    let theHand;
                    if (name === 'right'){
                        theHand = this.rightHand;
                        let indexTip = theHand.joints['index-finger-tip'];
                        let thumbTip = theHand.joints['thumb-tip'];
                        this.checkPinch(indexTip, thumbTip, name)
                    } 
                    else if (name === 'left'){
                        theHand = this.leftHand;
                        let indexTip = theHand.joints['index-finger-tip'];
                        this.checkTouch(indexTip, name)
                    }
                    else{
                        console.log('Hands not being tracked...')
                    }
                }
            }
        }
    }

    checkPinch(thumbTip, indexTip, hand) {
        // Calculate the distance between positions of Index Tip and Thubm Tip
        let diffX = Math.abs(indexTip.position.x - thumbTip.position.x)
        let diffY = Math.abs(indexTip.position.y - thumbTip.position.y)
        let diffZ = Math.abs(indexTip.position.z - thumbTip.position.z)

        if (diffX!=0 || diffY!=0 || diffZ!=0){
            // When hands are not seen, the diffs initialize at zeroes. Stops once hands are seen.
            if (diffX < 0.02 && diffY < 0.02 && diffZ < 0.02) {
                console.log(diffX, diffY, diffZ)
                console.log(hand + "PINCHING")
                let geometryPinch = new THREE.SphereBufferGeometry(0.01, 30, 30);
                let materialPinch = new THREE.MeshStandardMaterial({
                     color: this.drawColor
                });
                let spherePinch = new THREE.Mesh(geometryPinch, materialPinch);
                spherePinch.position.set(indexTip.position.x, indexTip.position.y, indexTip.position.z);
                this.scene.add(spherePinch);
            }
        }
    }

    checkTouch(indexTip, hand) {
        const distanceIndex1 = indexTip.getWorldPosition(tmpVector1).distanceTo(this.plane1.getWorldPosition(tmpVector2));
        if (distanceIndex1 < 0.05) {
            console.log('Touch White')
            this.drawColor = 0xffffff
        }

        const distanceIndex2 = indexTip.getWorldPosition(tmpVector1).distanceTo(this.plane2.getWorldPosition(tmpVector2));
        if (distanceIndex2 < 0.05) {
            console.log('Touch Yellow')
            this.drawColor = 0xffff00
        }

        const distanceIndex3 = indexTip.getWorldPosition(tmpVector1).distanceTo(this.plane3.getWorldPosition(tmpVector2));
        if (distanceIndex3 < 0.05) {
            console.log('Touch Red')
            this.drawColor = 0xff0000
        }

        const distanceIndex4 = indexTip.getWorldPosition(tmpVector1).distanceTo(this.plane4.getWorldPosition(tmpVector2));
        if (distanceIndex4 < 0.05) {
            console.log('Touch Blue')
            this.drawColor = 0x0000ff
        }

        const distanceIndex5 = indexTip.getWorldPosition(tmpVector1).distanceTo(this.plane5.getWorldPosition(tmpVector2));
        if (distanceIndex5 < 0.05) {
            console.log('Touch Green')
            this.drawColor = 0x00ff00
        }

    }

    addColors(){
        const geometry = new THREE.PlaneGeometry( 0.1, 0.1 );
        const material1 = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
        const material2 = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
        const material3 = new THREE.MeshBasicMaterial( {color: 0xff0000, side: THREE.DoubleSide} );
        const material4 = new THREE.MeshBasicMaterial( {color: 0x0000ff, side: THREE.DoubleSide} );
        const material5 = new THREE.MeshBasicMaterial( {color: 0x00ff00, side: THREE.DoubleSide} );

        this.plane1 = new THREE.Mesh( geometry, material1 );
        this.plane2 = new THREE.Mesh( geometry, material2 );
        this.plane3 = new THREE.Mesh( geometry, material3 );
        this.plane4 = new THREE.Mesh( geometry, material4 );
        this.plane5 = new THREE.Mesh( geometry, material5 );

        this.scene.add( this.plane1 );
        this.scene.add( this.plane2 );
        this.scene.add( this.plane3 );
        this.scene.add( this.plane4 );
        this.scene.add( this.plane5 );

        this.plane1.position.set(-0.1, 0.8, 0.1);
        this.plane2.position.set(-0.1, 0.8, 0.2);
        this.plane3.position.set(-0.1, 0.8, 0.3);
        this.plane4.position.set(-0.1, 0.8, 0.4);
        this.plane5.position.set(-0.1, 0.8, 0.5);

        this.plane1.rotation.set(0, 80, 0);
        this.plane2.rotation.set(0, 80, 0);
        this.plane3.rotation.set(0, 80, 0);
        this.plane4.rotation.set(0, 80, 0);
        this.plane5.rotation.set(0, 80, 0);

    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    render() {
        this.renderer.render(this.scene, this.camera);
        this.getHandVisibilityStatus();
    }

    createCamera() {
        const camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            100
        );
        camera.position.set(0, 1.6, 3);
        return camera;
    }

    createScene() {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x808080);
        return scene;
    }

    createRenderer() {
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.xr.enabled = true;
        return renderer;
    }

    addLight() {
        const ambient = new THREE.HemisphereLight(0x606060, 0x404040);
        this.scene.add(ambient);
        const light = new THREE.DirectionalLight(0xffffff);
        light.position.set(1, 1, 1).normalize();
        this.scene.add(light);
    }
    setupVR() {
        this.renderer.xr.enabled = true;
        document.body.appendChild(VRButton.createButton(this.renderer));
    }
} 

export default App;
