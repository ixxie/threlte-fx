import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

import { OutsideEdgesGeometry } from './OutsideEdgesGeometry.js';
import { ConditionalEdgesGeometry } from './ConditionalEdgesGeometry.js';
import { ConditionalEdgesShader } from './ConditionalEdgesShader.js';
import { ConditionalLineSegmentsGeometry } from './ConditionalLineSegmentsGeometry.js';
import { ConditionalLineMaterial } from './ConditionalLineMaterial.js';
import { ColoredShadowMaterial } from './ColoredShadowMaterial.js';

const LIGHT_MODEL = 0xffffff;
const LIGHT_LINES = 0x455a64;

function mergeObject(object) {
	object.updateMatrixWorld(true);

	const geometry = [];
	object.traverse((c) => {
		if (c.isMesh) {
			const g = c.geometry;
			g.applyMatrix4(c.matrixWorld);
			for (const key in g.attributes) {
				if (key !== 'position' && key !== 'normal') {
					g.deleteAttribute(key);
				}
			}
			geometry.push(g.toNonIndexed());
		}
	});

	const mergedGeometries = BufferGeometryUtils.mergeBufferGeometries(geometry, false);
	const mergedGeometry = BufferGeometryUtils.mergeVertices(mergedGeometries).center();

	const group = new THREE.Group();
	const mesh = new THREE.Mesh(mergedGeometry);
	group.add(mesh);
	return group;
}

export class OutlineEffect {
	constructor(
		scene,
		gltf,
		params = {
			colors: 'LIGHT',
			backgroundColor: '#0d2a28',
			modelColor: '#0d2a28',
			lineColor: '#ffb400',
			shadowColor: '#44491f',

			lit: false,
			opacity: 0.85,
			threshold: 40,
			display: 'THRESHOLD_EDGES',
			displayConditionalEdges: true,
			thickness: 1,
			useThickLines: false,
			model: 'HELMET'
		}
	) {
		this.scene = scene;
		this.params = params;

		const model = mergeObject(gltf.scene);
		model.children[0].geometry.computeBoundingBox();
		model.children[0].castShadow = true;

		this.originalModel = model;
		this.edgesModel = null;
		this.backgroundModel = null;
		this.conditionalModel = null;
		this.shadowModel = null;
		this.depthModel = null;

		this.initEdgesModel();
		this.initBackgroundModel();
		this.initConditionalModel();
	}

	initBackgroundModel() {
		if (this.backgroundModel) {
			this.backgroundModel.parent.remove(backgroundModel);
			this.shadowModel.parent.remove(shadowModel);
			this.depthModel.parent.remove(depthModel);

			this.backgroundModel.traverse((c) => {
				if (c.isMesh) {
					c.material.dispose();
				}
			});

			this.shadowModel.traverse((c) => {
				if (c.isMesh) {
					c.material.dispose();
				}
			});

			this.depthModel.traverse((c) => {
				if (c.isMesh) {
					c.material.dispose();
				}
			});
		}

		if (!this.originalModel) {
			return;
		}

		this.backgroundModel = this.originalModel.clone();
		this.backgroundModel.traverse((c) => {
			if (c.isMesh) {
				c.material = new THREE.MeshBasicMaterial({ color: LIGHT_MODEL });
				c.material.polygonOffset = true;
				c.material.polygonOffsetFactor = 1;
				c.material.polygonOffsetUnits = 1;
				c.renderOrder = 2;
			}
		});
		this.scene.add(this.backgroundModel);

		this.shadowModel = this.originalModel.clone();
		this.shadowModel.traverse((c) => {
			if (c.isMesh) {
				c.material = new ColoredShadowMaterial({ color: LIGHT_MODEL, shininess: 1.0 });
				c.material.polygonOffset = true;
				c.material.polygonOffsetFactor = 1;
				c.material.polygonOffsetUnits = 1;
				c.receiveShadow = true;
				c.renderOrder = 2;
			}
		});
		this.scene.add(this.shadowModel);

		this.depthModel = this.originalModel.clone();
		this.depthModel.traverse((c) => {
			if (c.isMesh) {
				c.material = new THREE.MeshBasicMaterial({ color: LIGHT_MODEL });
				c.material.polygonOffset = true;
				c.material.polygonOffsetFactor = 1;
				c.material.polygonOffsetUnits = 1;
				c.material.colorWrite = false;
				c.renderOrder = 1;
			}
		});
		this.scene.add(this.depthModel);
	}

	initEdgesModel() {
		// remove any previous model
		if (this.edgesModel) {
			this.edgesModel.parent.remove(this.edgesModel);
			this.edgesModel.traverse((c) => {
				if (c.isMesh) {
					if (Array.isArray(c.material)) {
						c.material.forEach((m) => m.dispose());
					} else {
						c.material.dispose();
					}
				}
			});
		}

		// early out if there's no model loaded
		if (!this.originalModel) {
			return;
		}

		// store the model and add it to the scene to display
		// behind the lines
		this.edgesModel = this.originalModel.clone();
		this.scene.add(this.edgesModel);

		// early out if we're not displaying any type of edge
		if (this.params.display === 'NONE') {
			this.edgesModel.visible = false;
			return;
		}

		const meshes = [];
		this.edgesModel.traverse((c) => {
			if (c.isMesh) {
				meshes.push(c);
			}
		});

		for (const key in meshes) {
			const mesh = meshes[key];
			const parent = mesh.parent;

			let lineGeom;
			if (this.params.display === 'THRESHOLD_EDGES') {
				lineGeom = new THREE.EdgesGeometry(mesh.geometry, this.params.threshold);
			} else {
				const mergeGeom = mesh.geometry.clone();
				mergeGeom.deleteAttribute('uv');
				mergeGeom.deleteAttribute('uv2');
				lineGeom = new OutsideEdgesGeometry(BufferGeometryUtils.mergeVertices(mergeGeom, 1e-3));
			}

			const line = new THREE.LineSegments(
				lineGeom,
				new THREE.LineBasicMaterial({ color: LIGHT_LINES })
			);
			line.position.copy(mesh.position);
			line.scale.copy(mesh.scale);
			line.rotation.copy(mesh.rotation);

			const thickLineGeom = new LineSegmentsGeometry().fromEdgesGeometry(lineGeom);
			const thickLines = new LineSegments2(
				thickLineGeom,
				new LineMaterial({ color: LIGHT_LINES, linewidth: 3 })
			);
			thickLines.position.copy(mesh.position);
			thickLines.scale.copy(mesh.scale);
			thickLines.rotation.copy(mesh.rotation);

			parent.remove(mesh);
			parent.add(line);
			parent.add(thickLines);
		}
	}

	initConditionalModel() {
		// remove the original model
		if (this.conditionalModel) {
			this.conditionalModel.parent.remove(this.conditionalModel);
			this.conditionalModel.traverse((c) => {
				if (c.isMesh) {
					c.material.dispose();
				}
			});
		}

		// if we have no loaded model then exit
		if (!this.originalModel) {
			return;
		}

		this.conditionalModel = this.originalModel.clone();
		this.scene.add(this.conditionalModel);
		this.conditionalModel.visible = false;

		// get all meshes
		const meshes = [];
		this.conditionalModel.traverse((c) => {
			if (c.isMesh) {
				meshes.push(c);
			}
		});

		for (const key in meshes) {
			const mesh = meshes[key];
			const parent = mesh.parent;

			// Remove everything but the position attribute
			const mergedGeom = mesh.geometry.clone();
			for (const key in mergedGeom.attributes) {
				if (key !== 'position') {
					mergedGeom.deleteAttribute(key);
				}
			}

			// Create the conditional edges geometry and associated material
			const lineGeom = new ConditionalEdgesGeometry(BufferGeometryUtils.mergeVertices(mergedGeom));
			const material = new THREE.ShaderMaterial(ConditionalEdgesShader);
			material.uniforms.diffuse.value.set(LIGHT_LINES);

			// Create the line segments objects and replace the mesh
			const line = new THREE.LineSegments(lineGeom, material);
			line.position.copy(mesh.position);
			line.scale.copy(mesh.scale);
			line.rotation.copy(mesh.rotation);

			const thickLineGeom = new ConditionalLineSegmentsGeometry().fromConditionalEdgesGeometry(
				lineGeom
			);
			const thickLines = new LineSegments2(
				thickLineGeom,
				new ConditionalLineMaterial({ color: LIGHT_LINES, linewidth: 2 })
			);
			thickLines.position.copy(mesh.position);
			thickLines.scale.copy(mesh.scale);
			thickLines.rotation.copy(mesh.rotation);

			parent.remove(mesh);
			parent.add(line);
			parent.add(thickLines);
		}
	}
}
