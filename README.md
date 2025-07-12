# Observable playground

I used this playground to learn how to use the following open source components:

- [Observable Framework](https://observablehq.com/framework/)
- [Observable Plot](https://observablehq.com/plot/)
- [Arquero](https://idl.uw.edu/arquero/)

I used this playground to deploy information on <https://data.sklein.xyz> but this is a temporary situation.
This was not the primary objective of this playground.

```sh
$ mise install
$ pnpm install
$ ./scripts/generate-all-conversations.json.js
$ pnpm run dev
Observable Framework v1.13.3
↳ http://127.0.0.1:3000/
```

Si besoin, voici comment générer une version statique de ce site:

```sh
$ pnpm run build
$ pnpm run preview
```

## Build and test Docker image

First I build the image:

```sh
$ docker compose build
```

Then I start this docker image:

```sh
$ docker compose up -d
```

And I check on <http://localhost> if it works properly.

If everything is good, I push this image:

```sh
$ docker compose push
```

The deployment is performed on the side of https://github.com/stephane-klein/sklein.xyz/tree/main/deployment
