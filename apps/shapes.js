
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

        this.addTexts();
        this.sceneObjects = []
        this.touchBox = false
        this.touchSphere = false
        this.touchOct = false
        this.touchTet = false

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
                        this.checkTouch(indexTip, name)
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

    checkTouch(indexTip, hand) {
        const distanceIndex1 = indexTip.getWorldPosition(tmpVector1).distanceTo(this.textMesh1.getWorldPosition(tmpVector2));
        if (distanceIndex1 < 0.05) {
            console.log('Touch Box')

            this.touchBox = true
            this.touchSphere = false
            this.touchOct = false
            this.touchTet = false
        }

        const distanceIndex2 = indexTip.getWorldPosition(tmpVector1).distanceTo(this.textMesh2.getWorldPosition(tmpVector2));
        if (distanceIndex2 < 0.05) {
            console.log('Touch Sphere')

            this.touchBox = false
            this.touchSphere = true
            this.touchOct = false
            this.touchTet = false
        }

        const distanceIndex3 = indexTip.getWorldPosition(tmpVector1).distanceTo(this.textMesh3.getWorldPosition(tmpVector2));
        if (distanceIndex3 < 0.05) {
            console.log('Touch Octahedron')
            this.touchBox = false
            this.touchSphere = false
            this.touchOct = true
            this.touchTet = false
        }

        const distanceIndex4 = indexTip.getWorldPosition(tmpVector1).distanceTo(this.textMesh4.getWorldPosition(tmpVector2));
        if (distanceIndex4 < 0.05) {
            console.log('Touch Octahedron')
            this.touchBox = false
            this.touchSphere = false
            this.touchOct = false
            this.touchTet = true
        }
    }

    addTexts(){
        const loader = new THREE.FontLoader();
        loader.load('./font.json', (font) => {
            const color = 0x006699;
            let materials = [
                new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } ), // front
                new THREE.MeshPhongMaterial( { color: 0xffffff } ) // side
            ];

            let textGeo1 = new THREE.TextGeometry( "Box", {
                font: font,
                size: 0.03,
                height: 0.01,
            } );

            let textGeo2 = new THREE.TextGeometry( "Sphere", {
                font: font,
                size: 0.03,
                height: 0.01,
            } );

            let textGeo3 = new THREE.TextGeometry( "Octahedron", {
                font: font,
                size: 0.03,
                height: 0.01,
            } );

            let textGeo4 = new THREE.TextGeometry( "Tetrahedron", {
                font: font,
                size: 0.03,
                height: 0.01,
            } );

            this.textMesh1 = new THREE.Mesh( textGeo1, materials );
            this.textMesh2 = new THREE.Mesh( textGeo2, materials );
            this.textMesh3 = new THREE.Mesh( textGeo3, materials );
            this.textMesh4 = new THREE.Mesh( textGeo4, materials );

            this.textMesh1.position.set(-0.3, 0.95, -0.1);
            this.textMesh2.position.set(-0.3, 0.95, -0.3);
            this.textMesh3.position.set(-0.3, 0.8, -0.1);
            this.textMesh4.position.set(-0.3, 0.8, -0.4);

            this.textMesh1.rotation.set(0, -80, 0);
            this.textMesh2.rotation.set(0, -80, 0);
            this.textMesh3.rotation.set(0, -80, 0);
            this.textMesh4.rotation.set(0, -80, 0);

            this.scene.add( this.textMesh1 );
            this.scene.add( this.textMesh2 );
            this.scene.add( this.textMesh3 );
            this.scene.add( this.textMesh4 );
        });

    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    render() {
        this.renderer.render(this.scene, this.camera);
        this.getHandVisibilityStatus();

        if (this.sceneObjects.length > 0){
            for (let i = 0; i < this.sceneObjects.length; i++){
                this.scene.remove(this.sceneObjects[i])
            }
        }

        if (this.touchBox == true){
            let geometryPinch = new THREE.BoxGeometry(0.05, 0.05, 0.05);
            let materialPinch = new THREE.MeshStandardMaterial({
                color: 0x000fff
            });
            let spherePinch = new THREE.Mesh(geometryPinch, materialPinch);
            spherePinch.position.set(0, 0.8, -0.5);
            this.sceneObjects.push(spherePinch);
            this.scene.add(spherePinch);
        }

        if (this.touchSphere == true){
            let geometryPinch = new THREE.SphereBufferGeometry(0.05, 30, 30);
            let materialPinch = new THREE.MeshStandardMaterial({
                color: 0x000fff
            });
            let spherePinch = new THREE.Mesh(geometryPinch, materialPinch);
            spherePinch.position.set(0, 0.8, -0.5);
            this.sceneObjects.push(spherePinch);
            this.scene.add(spherePinch);
        }

        if (this.touchOct == true){
            let geometryPinch = new THREE.OctahedronGeometry(0.05);
            let materialPinch = new THREE.MeshStandardMaterial({
                color: 0x000fff
            });
            let spherePinch = new THREE.Mesh(geometryPinch, materialPinch);
            spherePinch.position.set(0, 0.8, -0.5);
            this.sceneObjects.push(spherePinch);
            this.scene.add(spherePinch);
        }
        if (this.touchTet == true){
            let geometryPinch = new THREE.TetrahedronGeometry(0.05);
            let materialPinch = new THREE.MeshStandardMaterial({
                color: 0x000fff
            });
            let spherePinch = new THREE.Mesh(geometryPinch, materialPinch);
            spherePinch.position.set(0, 0.8, -0.5);
            this.sceneObjects.push(spherePinch);
            this.scene.add(spherePinch);
        }
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
