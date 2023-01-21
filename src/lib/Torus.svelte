<script lang="ts">
	import { Mesh } from '@threlte/core';
	import { TorusKnotGeometry, MeshStandardMaterial, DoubleSide } from 'three';

	const params = {
		q: 3,
		r: 2,
		radius: 6,
		radius2: 1.5
	};

	const torus = new TorusKnotGeometry(params.radius, params.radius2, 400, 50, params.q, params.r);
</script>

<Mesh
	geometry={torus}
	material={new MeshStandardMaterial({
		side: DoubleSide,
		color: 0x235623,
		roughness: 0.2,
		metalness: 0.1
	})}
/>
