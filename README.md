# Hi3D-comfyUI

ComfyUI custom node package for [Hi3D](https://hi3d.ai/) Image-to-3D API. Generate high-quality 3D models from images using Hi3D AI services.

## Features

- **Image to 3D** — Generate 3D models (GLB) from a single image or multi-view images.
- **Unified scene switch** — Use the `scene` parameter to switch between general object models and portrait/scene models in one node.
- **Model-resolution linkage** — The node UI automatically filters available model versions and resolutions based on the selected `scene` and `model`.
- **Texture regeneration** — Re-texture existing 3D models based on a reference image.
- **Load 3D model** — Load a GLB file from disk with a built-in upload button (GLB only).

## Installation

### Download from Hi3D Website

1. Download the `Hi3D-comfyUI` archive from the [Hi3D website](https://hi3d.ai/) or the project releases page.
2. Extract it into the `ComfyUI/custom_nodes` directory.
3. Install Python dependencies via the **ComfyUI built-in terminal** (click the terminal icon in the ComfyUI Manager toolbar) or any terminal with the same Python environment:

```bash
cd ComfyUI/custom_nodes/Hi3D-comfyUI
pip install -r requirements.txt
```

### ComfyUI Manager

Search for `Hi3D` in [ComfyUI Manager](https://github.com/ltdrdata/ComfyUI-Manager) and install it directly.

## Configuration

An API key pair (ak / sk) is required. Register at the [Hi3D website](https://hi3d.ai/) to obtain one.

### Option 1: config.json (Recommended)

Edit `config.json` in the node directory:

```json
{
    "Hi3D_ak": "your_access_key",
    "Hi3D_sk": "your_secret_key"
}
```

### Option 2: Environment Variables

```bash
export Hi3D_ak=your_access_key
export Hi3D_sk=your_secret_key
```

> If ak/sk are configured via `config.json` or environment variables, the input fields on the nodes can be left empty.

## Nodes

### Hi3D:ImageTo3D

Generates a 3D model (GLB) from a single image or multi-view images.

| Parameter | Type | Description |
|-----------|------|-------------|
| `ak` | STRING | API Access Key (leave empty if configured globally) |
| `sk` | STRING | API Secret Key (leave empty if configured globally) |
| `image` | IMAGE | Main front image (**required**) |
| `image_back` | IMAGE | Back reference image (optional, for multi-view) |
| `image_left` | IMAGE | Left reference image (optional, for multi-view) |
| `image_right` | IMAGE | Right reference image (optional, for multi-view) |
| `texture` | BOOLEAN | Generate texture maps (default: `False`) |
| `pbr` | BOOLEAN | PBR 开关（默认开启）。关闭=关闭，开启=开启。PBR需要 `texture=True`，且仅支持 `hitem3dv2.0` / `hitem3dv2.1`。 |
| `scene` | COMBO | Scene preset: `general` / `portrait` |
| `model` | COMBO | Model version (filtered by `scene`, see table below) |
| `resolution` | COMBO | Generation resolution (filtered by `model`, default: `1024`, i.e. 1024³) |
| `face` | INT | Target poly count (100,000–2,000,000, supports custom value). UI recommends by resolution: `512`→`500000`, `1024`→`1000000`, `1536/1536fast/1536pro/1536profast`→`2000000`. |

**Scene → Model mapping:**

| Scene | Available Models |
|-------|-----------------|
| `general` | `hitem3dv1.5`, `hitem3dv2.0`, `hitem3dv2.1` |
| `portrait` | `scene-portraitv1.5`, `scene-portraitv2.0`, `scene-portraitv2.1` |

**Model → Resolution mapping:**

| Model | Available Resolutions |
|-------|----------------------|
| `hitem3dv1.5` | `512`, `1024`, `1536`, `1536pro` |
| `hitem3dv2.0` | `512`, `1024`, `1536`, `1536pro` |
| `hitem3dv2.1` | `1536fast`, `1536pro` |
| `scene-portraitv1.5` | `1536` |
| `scene-portraitv2.0` | `1536pro` |
| `scene-portraitv2.1` | `1536profast`, `1536pro` |

**Outputs:**

| Output | Type | Description |
|--------|------|-------------|
| `GLB` | FILE3DGLB | Downloaded 3D model in GLB format |
| `model_task` | HI3D_MODEL_TASK | Task info, can be passed to the Texture node |

---

### Hi3D:Texture

Regenerates texture maps for an existing 3D model based on a reference image.

| Parameter | Type | Description |
|-----------|------|-------------|
| `ak` | STRING | API Access Key (leave empty if configured globally) |
| `sk` | STRING | API Secret Key (leave empty if configured globally) |
| `GLB` | FILE3DGLB | Input 3D model in GLB format |
| `image` | IMAGE | Texture reference image (**required**) |
| `model_task` | HI3D_MODEL_TASK | Upstream task info from ImageTo3D (optional) |
| `model` | COMBO | Model version: `hitem3dv1.5` / `hitem3dv2.0` / `hitem3dv2.1` / `scene-portraitv1.5` |
| `pbr` | BOOLEAN | PBR 开关（默认开启）。关闭=关闭，开启=开启。仅支持 `hitem3dv2.0` / `hitem3dv2.1`。 |

> Provide either `model_task` **or** `GLB`. When `model_task` is connected, its model URL is used automatically without re-uploading.

**Outputs:** Same as ImageTo3D.

---

### Hi3D:Load3DModel

Loads a GLB file from disk for use with the Texture node. Includes an **Upload GLB File** button to browse and upload files from your local computer.

| Parameter | Type | Description |
|-----------|------|-------------|
| `model_file` | COMBO | Select a GLB file from the dropdown or upload a new one |

**Output:**

| Output | Type | Description |
|--------|------|-------------|
| `model_3d` | FILE3D | Loaded 3D model, can be connected to the Texture node's `GLB` input |

## Example Workflows

### Image to 3D

Generate a 3D model from a single image:

![Image to 3D workflow](examples/image-to-3d.png)

### Texture Regeneration

Re-texture an existing 3D model with a reference image:

![Texture workflow](examples/Texture.png)

## License

MIT
