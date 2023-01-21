<script lang="ts">
	import { GLTF } from '@threlte/extras';

	export let model = 'cabin.glb';
</script>

<GLTF
	castShadow
	receiveShadow
	url={`./models/${model}`}
	scale={1}
	position={{ x: 0, y: 0, z: 0 }}
/>
