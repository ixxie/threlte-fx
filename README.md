# Porting Special Effects to Threlte

This repository is a sandbox to explore porting special effects to Threlte.

## $lib/core

`$lib/core` uses a handful of effects included in `three` by defalt. Using examples from the Threlte docs, I create simple components using the `Post` component provided by Threlte to verify I understand the API correctly. These work fine.

## $lib/sketch

[Jaume Sanchez (@spite)](https://github.com/spite) created a series of wonderful postprocessing effects and published them in a repo called [sketch](https://github.com/spite/sketch); you can check out the [live demos of these effects](https://spite.github.io/sketch/).

`$lib/sketch` is an attempt to port some of these effects to Threlte. `./shaders` and `./utils` are taken directly from shared libraries in the sketch repo. `CrosshatchA` and `CrosshatchB` are attempts to port the [post-cross-hatch-I](https://spite.github.io/sketch/post-cross-hatch-i/index.html) (see [source code here](https://github.com/spite/sketch/tree/master/post-cross-hatch-i)). Attempt A tries to use the `Post` class from the sketch repo, while attempt B tries to build the effect from the shaders using the API from Threlte examples. Neither attempt succeeds.

I don't have a deep understanding of WebGL, not the three.js API, so I am somewhat shooting in the dark.
