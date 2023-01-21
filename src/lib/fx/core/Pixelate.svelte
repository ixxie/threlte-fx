<script lang="ts">
	import { Pass, useThrelte } from '@threlte/core';

	import { RenderPixelatedPass } from 'three/addons/postprocessing/RenderPixelatedPass.js';

	const { scene, camera } = useThrelte();
</script>

<Pass pass={new RenderPixelatedPass(3, scene, $camera)} />
