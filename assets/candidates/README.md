# Model candidates

Drop `.glb` (or `.gltf`) files in this folder and open **/model-preview.html**.

The page finds them on its own — no list to edit. Each model is scaled to the same
1.8 m height so a big one doesn't just look better, dropped onto the floor, lit with
roughly the stadium's lighting, and its idle animation played. Under each you get the
triangle count and how many animation clips it ships with.

## What to look for

- **Rigged, with animations.** A static mesh is a lot more work — it needs rigging
  before it can run, and this game needs at least idle / run / kick.
- **Triangles.** There are 22 players on the pitch, so the on-screen cost is roughly
  22x whatever one model costs. Under ~15k each is comfortable; 50k each is not.
- **Height around 1.8 m** in its own units, so it drops into the game without fiddling.
- **Real player likenesses are worth avoiding** — the game is deliberately fictional
  everywhere else, and a recognisable face undoes that.
