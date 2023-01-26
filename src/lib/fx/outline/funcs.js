import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import { ConditionalEdgesGeometry } from './ConditionalEdgesGeometry.js';
import { ConditionalEdgesShader } from './ConditionalEdgesShader.js';

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

export function initOriginalModel(gltf) {
	if (!gltf) {
		return;
	}
	const originalModel = mergeObject(gltf.scene);
	originalModel.children[0].geometry.computeBoundingBox();
	originalModel.children[0].castShadow = true;
	return originalModel;
}

export function initFillModel(originalModel, params) {
	if (!originalModel) {
		return;
	}
	let fillModel = originalModel.clone();
	fillModel.traverse((c) => {
		if (c.isMesh) {
			c.material = new THREE.MeshBasicMaterial();
			c.material.polygonOffset = true;
			c.material.polygonOffsetFactor = 1;
			c.material.polygonOffsetUnits = 1;
			c.renderOrder = 2;
		}
	});
	fillModel.visible = true;
	fillModel.traverse((c) => {
		if (c.isMesh) {
			c.material.transparent = params.fill.opacity !== 1.0;
			c.material.opacity = params.fill.opacity;
			c.material.color.set(params.fill.color);
		}
	});
	return fillModel;
}

export function initLineModel(originalModel, params) {
	if (!originalModel) {
		return;
	}
	const lineModel = originalModel.clone();

	const meshes = [];
	lineModel.traverse((c) => {
		if (c.isMesh) {
			meshes.push(c);
		}
	});

	for (const key in meshes) {
		const mesh = meshes[key];
		const parent = mesh.parent;

		let lineGeom;
		lineGeom = new THREE.EdgesGeometry(mesh.geometry, params.line.threshold);

		const line = new THREE.LineSegments(
			lineGeom,
			new THREE.LineBasicMaterial({ color: params.line.color, linewidth: params.line.width })
		);
		line.position.copy(mesh.position);
		line.scale.copy(mesh.scale);
		line.rotation.copy(mesh.rotation);

		parent.remove(mesh);
		parent.add(line);
	}

	lineModel.traverse((c) => {
		if (c.material) {
			c.material.linewidth = params.line.width; // broken
			c.material.color.set(params.line.color);
		}
	});

	return lineModel;
}

export function initOutlineModel(originalModel, params) {
	if (!originalModel) {
		return;
	}
	let outlineModel = originalModel.clone();
	outlineModel.visible = false;

	// get all meshes
	const meshes = [];
	outlineModel.traverse((c) => {
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
		material.uniforms.diffuse.value.set(params.line.color);

		// Create the line segments objects and replace the mesh
		const line = new THREE.LineSegments(lineGeom, material);
		line.position.copy(mesh.position);
		line.scale.copy(mesh.scale);
		line.rotation.copy(mesh.rotation);

		parent.remove(mesh);
		parent.add(line);
	}
	outlineModel.visible = true;
	outlineModel.traverse((c) => {
		if (c.material) {
			c.material.uniforms.diffuse.value.set(params.linesColor);
		}
	});
	return outlineModel;
}
