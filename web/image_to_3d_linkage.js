import { app } from "../../scripts/app.js";

const SCENE_MODELS = {
    general: ["hitem3dv2.1", "hitem3dv1.5", "hitem3dv2.0"],
    portrait: ["scene-portraitv2.1", "scene-portraitv1.5", "scene-portraitv2.0"],
};

const MODEL_RESOLUTIONS = {
    "hitem3dv1.5": ["512", "1024", "1536", "1536pro"],
    "hitem3dv2.0": ["512", "1024", "1536", "1536pro"],
    "hitem3dv2.1": ["1536fast", "1536pro"],
    "scene-portraitv1.5": ["1536"],
    "scene-portraitv2.0": ["1536pro"],
    "scene-portraitv2.1": ["1536profast", "1536pro"],
};

const RECOMMENDED_FACE_BY_RESOLUTION = {
    "512": 500000,
    "1024": 1000000,
    "1536": 2000000,
    "1536fast": 2000000,
    "1536pro": 2000000,
    "1536profast": 2000000,
};

function getWidget(node, name) {
    return node.widgets?.find((widget) => widget.name === name);
}

function setComboValues(widget, values) {
    if (!widget) {
        return;
    }

    const nextValues = [...values];
    widget.options = widget.options || {};
    widget.options.values = nextValues;

    if (!nextValues.includes(widget.value)) {
        widget.value = nextValues[0];
    }
}

function wrapWidgetCallback(widget, onChange) {
    if (!widget) {
        return;
    }

    const originalCallback = widget.callback;
    widget.callback = function (...args) {
        const result = originalCallback?.apply(this, args);
        onChange();
        return result;
    };
}

function applyTexturePbrLinkage(textureWidget, pbrWidget) {
    if (!pbrWidget) {
        return;
    }
    const textureEnabled = Boolean(textureWidget?.value);
    pbrWidget.disabled = !textureEnabled;
    pbrWidget.readOnly = !textureEnabled;

    if (!textureEnabled && pbrWidget.value) {
        pbrWidget.value = false;
        pbrWidget.callback?.(false);
    }
}

function applyRecommendedFace(resolutionWidget, faceWidget) {
    if (!resolutionWidget || !faceWidget) {
        return;
    }
    const resolution = resolutionWidget.value;
    const recommendedFace = RECOMMENDED_FACE_BY_RESOLUTION[resolution];
    if (typeof recommendedFace === "number") {
        faceWidget.value = recommendedFace;
        faceWidget.callback?.(recommendedFace);
    }
}

app.registerExtension({
    name: "hitem3d.image_to_3d_linkage",
    async beforeRegisterNodeDef(nodeType, nodeData) {
        if (nodeData.name !== "ImageTo3DNode") {
            return;
        }

        const onNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            const result = onNodeCreated?.apply(this, arguments);

            const sceneWidget = getWidget(this, "scene");
            const modelWidget = getWidget(this, "model");
            const resolutionWidget = getWidget(this, "resolution");
            const textureWidget = getWidget(this, "texture");
            const pbrWidget = getWidget(this, "pbr");
            const faceWidget = getWidget(this, "face");

            const refreshOptions = () => {
                const scene = sceneWidget?.value || "general";
                const allowedModels = SCENE_MODELS[scene] || SCENE_MODELS.general;
                setComboValues(modelWidget, allowedModels);

                const model = modelWidget?.value || allowedModels[0];
                const allowedResolutions = MODEL_RESOLUTIONS[model] || MODEL_RESOLUTIONS[allowedModels[0]];
                setComboValues(resolutionWidget, allowedResolutions);
                applyRecommendedFace(resolutionWidget, faceWidget);
                applyTexturePbrLinkage(textureWidget, pbrWidget);

                this.setDirtyCanvas?.(true, true);
            };

            wrapWidgetCallback(sceneWidget, refreshOptions);
            wrapWidgetCallback(modelWidget, refreshOptions);
            wrapWidgetCallback(resolutionWidget, () => {
                applyRecommendedFace(resolutionWidget, faceWidget);
                this.setDirtyCanvas?.(true, true);
            });
            wrapWidgetCallback(textureWidget, () => {
                applyTexturePbrLinkage(textureWidget, pbrWidget);
                this.setDirtyCanvas?.(true, true);
            });
            refreshOptions();
            return result;
        };
    },
});
