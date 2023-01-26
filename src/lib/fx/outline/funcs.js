import * as THREE from 'three';
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

export function initModel(gltf) {
	if (!gltf) {
		return;
	}
	console.log('init original model');
	const originalModel = mergeObject(gltf.scene);
	originalModel.children[0].geometry.computeBoundingBox();
	originalModel.children[0].castShadow = true;
	return originalModel;
}

export function initBackgroundModel(originalModel, params) {
	if (!originalModel) {
		return;
	}
	console.log('init background model');

	let backgroundModel = originalModel.clone();
	backgroundModel.traverse((c) => {
		if (c.isMesh) {
			c.material = new THREE.MeshBasicMaterial({ color: params.lightModel });
			c.material.polygonOffset = true;
			c.material.polygonOffsetFactor = 1;
			c.material.polygonOffsetUnits = 1;
			c.renderOrder = 2;
		}
	});
	return backgroundModel;
}

export function initShadowModel(originalModel, params) {
	if (!originalModel) {
		return;
	}
	console.log('init shadow model');
	let shadowModel = originalModel.clone();
	shadowModel.traverse((c) => {
		if (c.isMesh) {
			c.material = new ColoredShadowMaterial({ color: params.lightModel, shininess: 1.0 });
			c.material.polygonOffset = true;
			c.material.polygonOffsetFactor = 1;
			c.material.polygonOffsetUnits = 1;
			c.receiveShadow = true;
			c.renderOrder = 2;
		}
	});
	return shadowModel;
}

export function initDepthModel(originalModel, params) {
	console.log('init depth model');
	if (!originalModel) {
		return;
	}
	let depthModel = originalModel.clone();
	depthModel.traverse((c) => {
		if (c.isMesh) {
			c.material = new THREE.MeshBasicMaterial({ color: params.lightModel });
			c.material.polygonOffset = true;
			c.material.polygonOffsetFactor = 1;
			c.material.polygonOffsetUnits = 1;
			c.material.colorWrite = false;
			c.renderOrder = 1;
		}
	});
	return depthModel;
}

export function initEdgesModel(originalModel, params) {
	if (!originalModel) {
		return;
	}
	console.log('init edges model');

	// store the model and add it to the scene to display
	// behind the lines
	let edgesModel = originalModel.clone();

	const meshes = [];
	edgesModel.traverse((c) => {
		if (c.isMesh) {
			meshes.push(c);
		}
	});

	for (const key in meshes) {
		const mesh = meshes[key];
		const parent = mesh.parent;

		let lineGeom;
		lineGeom = new THREE.EdgesGeometry(mesh.geometry, params.threshold);

		const line = new THREE.LineSegments(
			lineGeom,
			new THREE.LineBasicMaterial({ color: params.lightLines })
		);
		line.position.copy(mesh.position);
		line.scale.copy(mesh.scale);
		line.rotation.copy(mesh.rotation);

		const thickLineGeom = new LineSegmentsGeometry().fromEdgesGeometry(lineGeom);
		const thickLines = new LineSegments2(
			thickLineGeom,
			new LineMaterial({ color: params.lightLines, linewidth: 3 })
		);
		thickLines.position.copy(mesh.position);
		thickLines.scale.copy(mesh.scale);
		thickLines.rotation.copy(mesh.rotation);

		parent.remove(mesh);
		parent.add(line);
		parent.add(thickLines);
	}
	return edgesModel;
}

export function initConditionalModel(originalModel, params) {
	if (!originalModel) {
		return;
	}
	console.log('init conditional model');

	let conditionalModel = originalModel.clone();
	conditionalModel.visible = false;

	// get all meshes
	const meshes = [];
	conditionalModel.traverse((c) => {
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
		material.uniforms.diffuse.value.set(params.lightLines);

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
			new ConditionalLineMaterial({ color: params.lightLines, linewidth: 2 })
		);
		thickLines.position.copy(mesh.position);
		thickLines.scale.copy(mesh.scale);
		thickLines.rotation.copy(mesh.rotation);

		parent.remove(mesh);
		parent.add(line);
		parent.add(thickLines);
	}
	console.log(conditionalModel);
	return conditionalModel;
}
