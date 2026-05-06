(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/graph/PersonNode.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PersonNode",
    ()=>PersonNode
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/react/dist/esm/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/system/dist/esm/index.js [app-client] (ecmascript)");
'use client';
;
;
;
function PersonNode(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(22);
    if ($[0] !== "3ab1ea6d829552433154849fd809787bc56fb21e7aa7e183a4b4a758c5282d8d") {
        for(let $i = 0; $i < 22; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "3ab1ea6d829552433154849fd809787bc56fb21e7aa7e183a4b4a758c5282d8d";
    }
    const { data, selected } = t0;
    const d = data;
    let t1;
    if ($[1] !== d.name) {
        t1 = d.name.split(" ").map(_PersonNodeAnonymous).join("").toUpperCase().slice(0, 2);
        $[1] = d.name;
        $[2] = t1;
    } else {
        t1 = $[2];
    }
    const initials = t1;
    const t2 = `
          flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all cursor-pointer
          ${selected ? "ring-2 ring-white/60 scale-110" : "hover:scale-105"}
        `;
    let t3;
    if ($[3] !== d.color) {
        t3 = {
            backgroundColor: d.color
        };
        $[3] = d.color;
        $[4] = t3;
    } else {
        t3 = $[4];
    }
    let t4;
    if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Handle"], {
            type: "target",
            position: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Position"].Top,
            style: {
                opacity: 0,
                width: 1,
                height: 1,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)"
            }
        }, void 0, false, {
            fileName: "[project]/src/components/graph/PersonNode.tsx",
            lineNumber: 44,
            columnNumber: 10
        }, this);
        $[5] = t4;
    } else {
        t4 = $[5];
    }
    let t5;
    if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Handle"], {
            type: "source",
            position: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Position"].Bottom,
            style: {
                opacity: 0,
                width: 1,
                height: 1,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)"
            }
        }, void 0, false, {
            fileName: "[project]/src/components/graph/PersonNode.tsx",
            lineNumber: 58,
            columnNumber: 10
        }, this);
        $[6] = t5;
    } else {
        t5 = $[6];
    }
    let t6;
    if ($[7] !== initials || $[8] !== t3) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "relative w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-black/40",
            style: t3,
            children: [
                t4,
                initials,
                t5
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/graph/PersonNode.tsx",
            lineNumber: 72,
            columnNumber: 10
        }, this);
        $[7] = initials;
        $[8] = t3;
        $[9] = t6;
    } else {
        t6 = $[9];
    }
    let t7;
    if ($[10] !== d.name) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-xs font-medium text-white bg-black/50 backdrop-blur-sm px-2.5 py-0.5 rounded-full whitespace-nowrap max-w-[100px] overflow-hidden text-ellipsis",
            children: d.name
        }, void 0, false, {
            fileName: "[project]/src/components/graph/PersonNode.tsx",
            lineNumber: 81,
            columnNumber: 10
        }, this);
        $[10] = d.name;
        $[11] = t7;
    } else {
        t7 = $[11];
    }
    let t8;
    if ($[12] !== t2 || $[13] !== t6 || $[14] !== t7) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t2,
            children: [
                t6,
                t7
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/graph/PersonNode.tsx",
            lineNumber: 89,
            columnNumber: 10
        }, this);
        $[12] = t2;
        $[13] = t6;
        $[14] = t7;
        $[15] = t8;
    } else {
        t8 = $[15];
    }
    let t9;
    if ($[16] !== d || $[17] !== selected) {
        t9 = selected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex gap-1 mt-1",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: {
                        "PersonNode[<button>.onClick]": ()=>d.onAddLog(d.id)
                    }["PersonNode[<button>.onClick]"],
                    className: "text-[10px] bg-Accent/90 text-white px-2 py-0.5 rounded-full hover:bg-Accent transition-colors",
                    title: "Logg kontakt",
                    children: "+ Logg"
                }, void 0, false, {
                    fileName: "[project]/src/components/graph/PersonNode.tsx",
                    lineNumber: 99,
                    columnNumber: 55
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: {
                        "PersonNode[<button>.onClick]": ()=>d.onViewProfile(d.id)
                    }["PersonNode[<button>.onClick]"],
                    className: "text-[10px] bg-white/10 text-white px-2 py-0.5 rounded-full hover:bg-white/20 transition-colors",
                    title: "Se profil",
                    children: "Profil"
                }, void 0, false, {
                    fileName: "[project]/src/components/graph/PersonNode.tsx",
                    lineNumber: 101,
                    columnNumber: 185
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/graph/PersonNode.tsx",
            lineNumber: 99,
            columnNumber: 22
        }, this);
        $[16] = d;
        $[17] = selected;
        $[18] = t9;
    } else {
        t9 = $[18];
    }
    let t10;
    if ($[19] !== t8 || $[20] !== t9) {
        t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col items-center gap-1 select-none",
            children: [
                t8,
                t9
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/graph/PersonNode.tsx",
            lineNumber: 112,
            columnNumber: 11
        }, this);
        $[19] = t8;
        $[20] = t9;
        $[21] = t10;
    } else {
        t10 = $[21];
    }
    return t10;
}
_c = PersonNode;
function _PersonNodeAnonymous(w) {
    return w[0];
}
var _c;
__turbopack_context__.k.register(_c, "PersonNode");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/graph/RelationshipEdge.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RelationshipEdge",
    ()=>RelationshipEdge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/react/dist/esm/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/system/dist/esm/index.js [app-client] (ecmascript)");
'use client';
;
;
;
function RelationshipEdge(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(19);
    if ($[0] !== "0bbb7df4a6cc1921f8617ba012f8b7f1fd6722783402360467f56d3007fd1e2f") {
        for(let $i = 0; $i < 19; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "0bbb7df4a6cc1921f8617ba012f8b7f1fd6722783402360467f56d3007fd1e2f";
    }
    const { id, sourceX, sourceY, targetX, targetY, data } = t0;
    const edgeData = data;
    let t1;
    if ($[1] !== sourceX || $[2] !== sourceY || $[3] !== targetX || $[4] !== targetY) {
        t1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStraightPath"])({
            sourceX,
            sourceY,
            targetX,
            targetY
        });
        $[1] = sourceX;
        $[2] = sourceY;
        $[3] = targetX;
        $[4] = targetY;
        $[5] = t1;
    } else {
        t1 = $[5];
    }
    const [edgePath, labelX, labelY] = t1;
    const t2 = edgeData?.color ?? "#6c63ff";
    let t3;
    if ($[6] !== t2) {
        t3 = {
            stroke: t2,
            strokeWidth: 2,
            strokeOpacity: 0.7
        };
        $[6] = t2;
        $[7] = t3;
    } else {
        t3 = $[7];
    }
    let t4;
    if ($[8] !== edgePath || $[9] !== id || $[10] !== t3) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["BaseEdge"], {
            id: id,
            path: edgePath,
            style: t3
        }, void 0, false, {
            fileName: "[project]/src/components/graph/RelationshipEdge.tsx",
            lineNumber: 58,
            columnNumber: 10
        }, this);
        $[8] = edgePath;
        $[9] = id;
        $[10] = t3;
        $[11] = t4;
    } else {
        t4 = $[11];
    }
    let t5;
    if ($[12] !== edgeData || $[13] !== labelX || $[14] !== labelY) {
        t5 = edgeData?.label && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["EdgeLabelRenderer"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: "absolute",
                    transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                    pointerEvents: "all"
                },
                className: "text-[10px] text-white/70 bg-Primary/80 backdrop-blur-sm px-1.5 py-0.5 rounded-full border border-white/10",
                children: edgeData.label
            }, void 0, false, {
                fileName: "[project]/src/components/graph/RelationshipEdge.tsx",
                lineNumber: 68,
                columnNumber: 48
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/graph/RelationshipEdge.tsx",
            lineNumber: 68,
            columnNumber: 29
        }, this);
        $[12] = edgeData;
        $[13] = labelX;
        $[14] = labelY;
        $[15] = t5;
    } else {
        t5 = $[15];
    }
    let t6;
    if ($[16] !== t4 || $[17] !== t5) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                t4,
                t5
            ]
        }, void 0, true);
        $[16] = t4;
        $[17] = t5;
        $[18] = t6;
    } else {
        t6 = $[18];
    }
    return t6;
}
_c = RelationshipEdge;
var _c;
__turbopack_context__.k.register(_c, "RelationshipEdge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/graph/VennekartCanvas.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VennekartCanvas",
    ()=>VennekartCanvas
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/react/dist/esm/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$graph$2f$PersonNode$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/graph/PersonNode.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$graph$2f$RelationshipEdge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/graph/RelationshipEdge.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
const nodeTypes = {
    person: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$graph$2f$PersonNode$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PersonNode"]
};
const edgeTypes = {
    relationship: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$graph$2f$RelationshipEdge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RelationshipEdge"]
};
function VennekartCanvas(t0) {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(41);
    if ($[0] !== "ec57ff4bb62cc74c3ebac7bcf9b8b3facf35cfc0f576eaef90d51eb8561578af") {
        for(let $i = 0; $i < 41; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "ec57ff4bb62cc74c3ebac7bcf9b8b3facf35cfc0f576eaef90d51eb8561578af";
    }
    const { onAddPerson, onAddLog, onAddRelationship, refreshKey } = t0;
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = [];
        $[1] = t1;
    } else {
        t1 = $[1];
    }
    const [persons, setPersons] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(t1);
    let t2;
    if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = [];
        $[2] = t2;
    } else {
        t2 = $[2];
    }
    const [relationships, setRelationships] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(t2);
    let t3;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t3 = [];
        $[3] = t3;
    } else {
        t3 = $[3];
    }
    const [nodes, setNodes, onNodesChange] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useNodesState"])(t3);
    let t4;
    if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = [];
        $[4] = t4;
    } else {
        t4 = $[4];
    }
    const [edges, setEdges, onEdgesChange] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useEdgesState"])(t4);
    let t5;
    if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
        t5 = ({
            "VennekartCanvas[useEffect()]": ()=>{
                const fetchData = async function fetchData() {
                    const [personsRes, relationshipsRes] = await Promise.all([
                        fetch("/api/persons"),
                        fetch("/api/relationships")
                    ]);
                    if (!personsRes.ok || !relationshipsRes.ok) {
                        return;
                    }
                    const [personsData, relData] = await Promise.all([
                        personsRes.json(),
                        relationshipsRes.json()
                    ]);
                    setPersons(personsData);
                    setRelationships(relData);
                };
                fetchData();
            }
        })["VennekartCanvas[useEffect()]"];
        $[5] = t5;
    } else {
        t5 = $[5];
    }
    let t6;
    if ($[6] !== refreshKey) {
        t6 = [
            refreshKey
        ];
        $[6] = refreshKey;
        $[7] = t6;
    } else {
        t6 = $[7];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(t5, t6);
    let t7;
    let t8;
    if ($[8] !== onAddLog || $[9] !== persons || $[10] !== router || $[11] !== setNodes) {
        t7 = ({
            "VennekartCanvas[useEffect()]": ()=>{
                const newNodes = persons.map({
                    "VennekartCanvas[useEffect() > persons.map()]": (p)=>({
                            id: p.id,
                            type: "person",
                            position: {
                                x: p.positionX,
                                y: p.positionY
                            },
                            data: {
                                id: p.id,
                                name: p.name,
                                color: p.color,
                                initials: p.name.split(" ").map(_VennekartCanvasUseEffectPersonsMapAnonymous).join("").toUpperCase().slice(0, 2),
                                onAddLog,
                                onViewProfile: (id)=>router.push(`/person/${id}`)
                            }
                        })
                }["VennekartCanvas[useEffect() > persons.map()]"]);
                setNodes(newNodes);
            }
        })["VennekartCanvas[useEffect()]"];
        t8 = [
            persons,
            onAddLog,
            router,
            setNodes
        ];
        $[8] = onAddLog;
        $[9] = persons;
        $[10] = router;
        $[11] = setNodes;
        $[12] = t7;
        $[13] = t8;
    } else {
        t7 = $[12];
        t8 = $[13];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(t7, t8);
    let t10;
    let t9;
    if ($[14] !== relationships || $[15] !== setEdges) {
        t9 = ({
            "VennekartCanvas[useEffect()]": ()=>{
                const newEdges = relationships.map(_VennekartCanvasUseEffectRelationshipsMap);
                setEdges(newEdges);
            }
        })["VennekartCanvas[useEffect()]"];
        t10 = [
            relationships,
            setEdges
        ];
        $[14] = relationships;
        $[15] = setEdges;
        $[16] = t10;
        $[17] = t9;
    } else {
        t10 = $[16];
        t9 = $[17];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(t9, t10);
    const onNodeDragStop = _VennekartCanvasOnNodeDragStop;
    let t11;
    if ($[18] === Symbol.for("react.memo_cache_sentinel")) {
        t11 = {
            hideAttribution: true
        };
        $[18] = t11;
    } else {
        t11 = $[18];
    }
    let t12;
    if ($[19] === Symbol.for("react.memo_cache_sentinel")) {
        t12 = {
            padding: 0.3
        };
        $[19] = t12;
    } else {
        t12 = $[19];
    }
    let t13;
    let t14;
    if ($[20] === Symbol.for("react.memo_cache_sentinel")) {
        t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Background"], {
            variant: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["BackgroundVariant"].Dots,
            gap: 24,
            size: 1,
            color: "rgba(255,255,255,0.3)"
        }, void 0, false, {
            fileName: "[project]/src/components/graph/VennekartCanvas.tsx",
            lineNumber: 177,
            columnNumber: 11
        }, this);
        t14 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Controls"], {
            className: "!bg-Glass !border-GlassBorder !rounded-xl !shadow-lg"
        }, void 0, false, {
            fileName: "[project]/src/components/graph/VennekartCanvas.tsx",
            lineNumber: 178,
            columnNumber: 11
        }, this);
        $[20] = t13;
        $[21] = t14;
    } else {
        t13 = $[20];
        t14 = $[21];
    }
    let t15;
    if ($[22] !== edges || $[23] !== nodes || $[24] !== onEdgesChange || $[25] !== onNodesChange) {
        t15 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ReactFlow"], {
            nodes: nodes,
            edges: edges,
            onNodesChange: onNodesChange,
            onEdgesChange: onEdgesChange,
            onNodeDragStop: onNodeDragStop,
            nodeTypes: nodeTypes,
            edgeTypes: edgeTypes,
            proOptions: t11,
            fitView: true,
            fitViewOptions: t12,
            minZoom: 0.3,
            maxZoom: 2,
            children: [
                t13,
                t14
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/graph/VennekartCanvas.tsx",
            lineNumber: 187,
            columnNumber: 11
        }, this);
        $[22] = edges;
        $[23] = nodes;
        $[24] = onEdgesChange;
        $[25] = onNodesChange;
        $[26] = t15;
    } else {
        t15 = $[26];
    }
    let t16;
    if ($[27] === Symbol.for("react.memo_cache_sentinel")) {
        t16 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-Accent",
            children: "⟷"
        }, void 0, false, {
            fileName: "[project]/src/components/graph/VennekartCanvas.tsx",
            lineNumber: 198,
            columnNumber: 11
        }, this);
        $[27] = t16;
    } else {
        t16 = $[27];
    }
    let t17;
    if ($[28] !== onAddRelationship) {
        t17 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            onClick: onAddRelationship,
            className: "glass-card px-4 py-2 text-sm font-medium text-Text/80 hover:text-Text transition-colors flex items-center gap-2",
            title: "Legg til relasjon",
            children: [
                t16,
                " Relasjon"
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/graph/VennekartCanvas.tsx",
            lineNumber: 205,
            columnNumber: 11
        }, this);
        $[28] = onAddRelationship;
        $[29] = t17;
    } else {
        t17 = $[29];
    }
    let t18;
    if ($[30] !== onAddPerson) {
        t18 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            onClick: onAddPerson,
            className: "bg-Accent text-Primary px-5 py-3 rounded-2xl font-bold text-lg shadow-lg shadow-Accent/30 hover:opacity-90 transition-opacity",
            title: "Legg til person",
            children: "+"
        }, void 0, false, {
            fileName: "[project]/src/components/graph/VennekartCanvas.tsx",
            lineNumber: 213,
            columnNumber: 11
        }, this);
        $[30] = onAddPerson;
        $[31] = t18;
    } else {
        t18 = $[31];
    }
    let t19;
    if ($[32] !== t17 || $[33] !== t18) {
        t19 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "absolute bottom-6 right-6 flex flex-col gap-2 z-10",
            children: [
                t17,
                t18
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/graph/VennekartCanvas.tsx",
            lineNumber: 221,
            columnNumber: 11
        }, this);
        $[32] = t17;
        $[33] = t18;
        $[34] = t19;
    } else {
        t19 = $[34];
    }
    let t20;
    if ($[35] !== persons.length) {
        t20 = persons.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-Text/40 text-lg",
                    children: "Vennekartet ditt er tomt"
                }, void 0, false, {
                    fileName: "[project]/src/components/graph/VennekartCanvas.tsx",
                    lineNumber: 230,
                    columnNumber: 137
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-Text/30 text-sm",
                    children: "Trykk + for å legge til din første person"
                }, void 0, false, {
                    fileName: "[project]/src/components/graph/VennekartCanvas.tsx",
                    lineNumber: 230,
                    columnNumber: 201
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/graph/VennekartCanvas.tsx",
            lineNumber: 230,
            columnNumber: 35
        }, this);
        $[35] = persons.length;
        $[36] = t20;
    } else {
        t20 = $[36];
    }
    let t21;
    if ($[37] !== t15 || $[38] !== t19 || $[39] !== t20) {
        t21 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "relative flex-1 h-full",
            children: [
                t15,
                t19,
                t20
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/graph/VennekartCanvas.tsx",
            lineNumber: 238,
            columnNumber: 11
        }, this);
        $[37] = t15;
        $[38] = t19;
        $[39] = t20;
        $[40] = t21;
    } else {
        t21 = $[40];
    }
    return t21;
}
_s(VennekartCanvas, "30PjKkMvgb0fsQyG34woPkPoJ/4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useNodesState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useEdgesState"]
    ];
});
_c = VennekartCanvas;
async function _VennekartCanvasOnNodeDragStop(_event, node) {
    await fetch(`/api/persons/${node.id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            positionX: node.position.x,
            positionY: node.position.y
        })
    });
}
function _VennekartCanvasUseEffectRelationshipsMap(r) {
    return {
        id: r.id,
        source: r.fromPersonId,
        target: r.toPersonId,
        type: "relationship",
        data: {
            color: r.color,
            label: undefined
        }
    };
}
function _VennekartCanvasUseEffectPersonsMapAnonymous(w) {
    return w[0];
}
var _c;
__turbopack_context__.k.register(_c, "VennekartCanvas");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/TimelineStripe.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TimelineStripe",
    ()=>TimelineStripe
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
const LOG_EMOJI = {
    MET: '☕',
    CALLED: '📞',
    MESSAGE: '💬',
    OTHER: '📝'
};
function TimelineStripe(t0) {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(33);
    if ($[0] !== "ddf0b1417c16e1162093cc7e8d2348ad056affad9166376f2cb60eff1a0e9f58") {
        for(let $i = 0; $i < 33; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "ddf0b1417c16e1162093cc7e8d2348ad056affad9166376f2cb60eff1a0e9f58";
    }
    const { refreshKey, onAddLog } = t0;
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = [];
        $[1] = t1;
    } else {
        t1 = $[1];
    }
    const [entries, setEntries] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(t1);
    const [expanded, setExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    let t2;
    if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = ({
            "TimelineStripe[useEffect()]": ()=>{
                fetch("/api/log?limit=10").then(_TimelineStripeUseEffectAnonymous).then(setEntries);
            }
        })["TimelineStripe[useEffect()]"];
        $[2] = t2;
    } else {
        t2 = $[2];
    }
    let t3;
    if ($[3] !== refreshKey) {
        t3 = [
            refreshKey
        ];
        $[3] = refreshKey;
        $[4] = t3;
    } else {
        t3 = $[4];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(t2, t3);
    const formatDate = _TimelineStripeFormatDate;
    if (entries.length === 0 && !expanded) {
        let t4;
        if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
            t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: "Ingen kontakter logget ennå"
            }, void 0, false, {
                fileName: "[project]/src/components/TimelineStripe.tsx",
                lineNumber: 65,
                columnNumber: 12
            }, this);
            $[5] = t4;
        } else {
            t4 = $[5];
        }
        let t5;
        if ($[6] !== onAddLog) {
            t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mx-4 mt-2 px-4 py-2 glass-card flex items-center gap-3 text-sm text-Text/40",
                children: [
                    t4,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onAddLog,
                        className: "text-Accent hover:text-Accent/80 transition-colors ml-auto",
                        children: "+ Logg kontakt"
                    }, void 0, false, {
                        fileName: "[project]/src/components/TimelineStripe.tsx",
                        lineNumber: 72,
                        columnNumber: 109
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/TimelineStripe.tsx",
                lineNumber: 72,
                columnNumber: 12
            }, this);
            $[6] = onAddLog;
            $[7] = t5;
        } else {
            t5 = $[7];
        }
        return t5;
    }
    let t4;
    if ($[8] !== expanded) {
        t4 = ({
            "TimelineStripe[<div>.onClick]": ()=>setExpanded(!expanded)
        })["TimelineStripe[<div>.onClick]"];
        $[8] = expanded;
        $[9] = t4;
    } else {
        t4 = $[9];
    }
    let t5;
    if ($[10] !== entries) {
        let t6;
        if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
            t6 = ({
                "TimelineStripe[(anonymous)()]": (entry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1.5 text-sm whitespace-nowrap text-Text/70",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: LOG_EMOJI[entry.type]
                            }, void 0, false, {
                                fileName: "[project]/src/components/TimelineStripe.tsx",
                                lineNumber: 95,
                                columnNumber: 148
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-medium text-Text",
                                children: entry.person.name
                            }, void 0, false, {
                                fileName: "[project]/src/components/TimelineStripe.tsx",
                                lineNumber: 95,
                                columnNumber: 184
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-Text/40 text-xs",
                                children: formatDate(entry.date)
                            }, void 0, false, {
                                fileName: "[project]/src/components/TimelineStripe.tsx",
                                lineNumber: 95,
                                columnNumber: 250
                            }, this)
                        ]
                    }, entry.id, true, {
                        fileName: "[project]/src/components/TimelineStripe.tsx",
                        lineNumber: 95,
                        columnNumber: 51
                    }, this)
            })["TimelineStripe[(anonymous)()]"];
            $[12] = t6;
        } else {
            t6 = $[12];
        }
        t5 = entries.slice(0, 4).map(t6);
        $[10] = entries;
        $[11] = t5;
    } else {
        t5 = $[11];
    }
    let t6;
    if ($[13] !== t5) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex gap-4 flex-1 overflow-hidden",
            children: t5
        }, void 0, false, {
            fileName: "[project]/src/components/TimelineStripe.tsx",
            lineNumber: 109,
            columnNumber: 10
        }, this);
        $[13] = t5;
        $[14] = t6;
    } else {
        t6 = $[14];
    }
    let t7;
    if ($[15] !== entries.length) {
        t7 = entries.length > 4 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-xs",
            children: [
                "+",
                entries.length - 4,
                " til"
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/TimelineStripe.tsx",
            lineNumber: 117,
            columnNumber: 32
        }, this);
        $[15] = entries.length;
        $[16] = t7;
    } else {
        t7 = $[16];
    }
    const t8 = expanded ? "rotate(180deg)" : "rotate(0deg)";
    let t9;
    if ($[17] !== t8) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "transition-transform duration-200 inline-block",
            style: {
                transform: t8
            },
            children: "▾"
        }, void 0, false, {
            fileName: "[project]/src/components/TimelineStripe.tsx",
            lineNumber: 126,
            columnNumber: 10
        }, this);
        $[17] = t8;
        $[18] = t9;
    } else {
        t9 = $[18];
    }
    let t10;
    if ($[19] !== t7 || $[20] !== t9) {
        t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-2 text-Text/40 text-sm shrink-0",
            children: [
                t7,
                t9
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/TimelineStripe.tsx",
            lineNumber: 136,
            columnNumber: 11
        }, this);
        $[19] = t7;
        $[20] = t9;
        $[21] = t10;
    } else {
        t10 = $[21];
    }
    let t11;
    if ($[22] !== t10 || $[23] !== t4 || $[24] !== t6) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-3 px-4 py-2 cursor-pointer",
            onClick: t4,
            children: [
                t6,
                t10
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/TimelineStripe.tsx",
            lineNumber: 145,
            columnNumber: 11
        }, this);
        $[22] = t10;
        $[23] = t4;
        $[24] = t6;
        $[25] = t11;
    } else {
        t11 = $[25];
    }
    let t12;
    if ($[26] !== entries || $[27] !== expanded || $[28] !== onAddLog) {
        t12 = expanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "border-t border-white/5 px-4 py-3 flex flex-col gap-2 max-h-48 overflow-y-auto",
            children: [
                entries.map({
                    "TimelineStripe[entries.map()]": (entry_0)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: `/person/${entry_0.personId}`,
                            className: "flex items-start gap-3 hover:bg-white/5 rounded-lg px-2 py-1.5 transition-colors group",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-base mt-0.5",
                                    children: LOG_EMOJI[entry_0.type]
                                }, void 0, false, {
                                    fileName: "[project]/src/components/TimelineStripe.tsx",
                                    lineNumber: 156,
                                    columnNumber: 212
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1 min-w-0",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-medium text-Text text-sm group-hover:text-Accent transition-colors",
                                                    children: entry_0.person.name
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/TimelineStripe.tsx",
                                                    lineNumber: 156,
                                                    columnNumber: 352
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-Text/40 text-xs",
                                                    children: formatDate(entry_0.date)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/TimelineStripe.tsx",
                                                    lineNumber: 156,
                                                    columnNumber: 470
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/TimelineStripe.tsx",
                                            lineNumber: 156,
                                            columnNumber: 311
                                        }, this),
                                        entry_0.notes && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-Text/50 truncate",
                                            children: entry_0.notes
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/TimelineStripe.tsx",
                                            lineNumber: 156,
                                            columnNumber: 566
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/TimelineStripe.tsx",
                                    lineNumber: 156,
                                    columnNumber: 279
                                }, this)
                            ]
                        }, entry_0.id, true, {
                            fileName: "[project]/src/components/TimelineStripe.tsx",
                            lineNumber: 156,
                            columnNumber: 53
                        }, this)
                }["TimelineStripe[entries.map()]"]),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: {
                        "TimelineStripe[<button>.onClick]": (e)=>{
                            e.stopPropagation();
                            onAddLog();
                        }
                    }["TimelineStripe[<button>.onClick]"],
                    className: "text-xs text-Accent hover:text-Accent/80 transition-colors text-left px-2 py-1",
                    children: "+ Logg ny kontakt"
                }, void 0, false, {
                    fileName: "[project]/src/components/TimelineStripe.tsx",
                    lineNumber: 157,
                    columnNumber: 43
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/TimelineStripe.tsx",
            lineNumber: 155,
            columnNumber: 23
        }, this);
        $[26] = entries;
        $[27] = expanded;
        $[28] = onAddLog;
        $[29] = t12;
    } else {
        t12 = $[29];
    }
    let t13;
    if ($[30] !== t11 || $[31] !== t12) {
        t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mx-4 mt-2 glass-card overflow-hidden transition-all duration-300",
            children: [
                t11,
                t12
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/TimelineStripe.tsx",
            lineNumber: 172,
            columnNumber: 11
        }, this);
        $[30] = t11;
        $[31] = t12;
        $[32] = t13;
    } else {
        t13 = $[32];
    }
    return t13;
}
_s(TimelineStripe, "xvf7l0eTHVO+4Tua3+x/A5kWt7Y=");
_c = TimelineStripe;
function _TimelineStripeFormatDate(d) {
    const date = new Date(d);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
    if (diffDays === 0) {
        return "I dag";
    }
    if (diffDays === 1) {
        return "I g\xE5r";
    }
    if (diffDays < 7) {
        return `${diffDays} dager siden`;
    }
    return date.toLocaleDateString("no-NO", {
        day: "numeric",
        month: "short"
    });
}
function _TimelineStripeUseEffectAnonymous(r) {
    return r.ok ? r.json() : [];
}
var _c;
__turbopack_context__.k.register(_c, "TimelineStripe");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/RemindersSidebar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RemindersSidebar",
    ()=>RemindersSidebar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function RemindersSidebar(t0) {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(16);
    if ($[0] !== "c5b8ffc6eb3a697b4339a57f037d4f771c59230ea66bf97f42e73c1a2e52c108") {
        for(let $i = 0; $i < 16; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "c5b8ffc6eb3a697b4339a57f037d4f771c59230ea66bf97f42e73c1a2e52c108";
    }
    const { refreshKey } = t0;
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = [];
        $[1] = t1;
    } else {
        t1 = $[1];
    }
    const [reminders, setReminders] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(t1);
    const [visible, setVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    let t2;
    if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = ({
            "RemindersSidebar[useEffect()]": ()=>{
                const fetchReminders = async function fetchReminders() {
                    await fetch("/api/reminders", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            action: "generate-auto"
                        })
                    });
                    const res = await fetch("/api/reminders");
                    if (res.ok) {
                        setReminders(await res.json());
                    }
                };
                fetchReminders();
            }
        })["RemindersSidebar[useEffect()]"];
        $[2] = t2;
    } else {
        t2 = $[2];
    }
    let t3;
    if ($[3] !== refreshKey) {
        t3 = [
            refreshKey
        ];
        $[3] = refreshKey;
        $[4] = t3;
    } else {
        t3 = $[4];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(t2, t3);
    let t4;
    if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = ({
            "RemindersSidebar[dismiss]": async (id)=>{
                await fetch(`/api/reminders/${id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        dismissed: true
                    })
                });
                setReminders({
                    "RemindersSidebar[dismiss > setReminders()]": (prev)=>prev.filter({
                            "RemindersSidebar[dismiss > setReminders() > prev.filter()]": (r)=>r.id !== id
                        }["RemindersSidebar[dismiss > setReminders() > prev.filter()]"])
                }["RemindersSidebar[dismiss > setReminders()]"]);
            }
        })["RemindersSidebar[dismiss]"];
        $[5] = t4;
    } else {
        t4 = $[5];
    }
    const dismiss = t4;
    if (!visible) {
        let t5;
        if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
            t5 = ({
                "RemindersSidebar[<button>.onClick]": ()=>setVisible(true)
            })["RemindersSidebar[<button>.onClick]"];
            $[6] = t5;
        } else {
            t5 = $[6];
        }
        let t6;
        if ($[7] !== reminders.length) {
            t6 = reminders.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-Accent font-bold",
                children: reminders.length
            }, void 0, false, {
                fileName: "[project]/src/components/RemindersSidebar.tsx",
                lineNumber: 105,
                columnNumber: 36
            }, this);
            $[7] = reminders.length;
            $[8] = t6;
        } else {
            t6 = $[8];
        }
        let t7;
        if ($[9] !== t6) {
            t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: t5,
                className: "absolute right-4 top-4 glass-card px-3 py-2 text-sm text-Text/60 hover:text-Text transition-colors z-10",
                title: "Vis p\xE5minnelser",
                children: [
                    "🔔 ",
                    t6
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/RemindersSidebar.tsx",
                lineNumber: 113,
                columnNumber: 12
            }, this);
            $[9] = t6;
            $[10] = t7;
        } else {
            t7 = $[10];
        }
        return t7;
    }
    let t5;
    if ($[11] === Symbol.for("react.memo_cache_sentinel")) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-between px-4 py-3 border-b border-white/5",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-sm font-semibold text-Text/80",
                    children: "Påminnelser"
                }, void 0, false, {
                    fileName: "[project]/src/components/RemindersSidebar.tsx",
                    lineNumber: 123,
                    columnNumber: 95
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: {
                        "RemindersSidebar[<button>.onClick]": ()=>setVisible(false)
                    }["RemindersSidebar[<button>.onClick]"],
                    className: "text-Text/30 hover:text-Text transition-colors text-lg leading-none",
                    "aria-label": "Skjul",
                    children: "×"
                }, void 0, false, {
                    fileName: "[project]/src/components/RemindersSidebar.tsx",
                    lineNumber: 123,
                    columnNumber: 162
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RemindersSidebar.tsx",
            lineNumber: 123,
            columnNumber: 10
        }, this);
        $[11] = t5;
    } else {
        t5 = $[11];
    }
    let t6;
    if ($[12] !== reminders) {
        t6 = reminders.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: "text-xs text-Text/30 text-center py-6",
            children: "Ingen påminnelser"
        }, void 0, false, {
            fileName: "[project]/src/components/RemindersSidebar.tsx",
            lineNumber: 132,
            columnNumber: 35
        }, this) : reminders.map({
            "RemindersSidebar[reminders.map()]": (r_0)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white/4 rounded-xl p-3 flex flex-col gap-1.5 group",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-start gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-sm mt-0.5",
                                    children: r_0.type === "AUTO" ? "\u23F0" : "\uD83D\uDCCC"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/RemindersSidebar.tsx",
                                    lineNumber: 133,
                                    columnNumber: 175
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-Text/80 flex-1 leading-relaxed",
                                    children: r_0.message
                                }, void 0, false, {
                                    fileName: "[project]/src/components/RemindersSidebar.tsx",
                                    lineNumber: 133,
                                    columnNumber: 264
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/RemindersSidebar.tsx",
                            lineNumber: 133,
                            columnNumber: 135
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: `/person/${r_0.personId}`,
                                    className: "text-xs text-Accent hover:text-Accent/80 transition-colors",
                                    children: [
                                        r_0.person.name,
                                        " →"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/RemindersSidebar.tsx",
                                    lineNumber: 133,
                                    columnNumber: 387
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: {
                                        "RemindersSidebar[reminders.map() > <button>.onClick]": ()=>dismiss(r_0.id)
                                    }["RemindersSidebar[reminders.map() > <button>.onClick]"],
                                    className: "text-xs text-Text/30 hover:text-Text/60 transition-colors ml-auto opacity-0 group-hover:opacity-100",
                                    children: "Avvis"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/RemindersSidebar.tsx",
                                    lineNumber: 133,
                                    columnNumber: 523
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/RemindersSidebar.tsx",
                            lineNumber: 133,
                            columnNumber: 346
                        }, this)
                    ]
                }, r_0.id, true, {
                    fileName: "[project]/src/components/RemindersSidebar.tsx",
                    lineNumber: 133,
                    columnNumber: 51
                }, this)
        }["RemindersSidebar[reminders.map()]"]);
        $[12] = reminders;
        $[13] = t6;
    } else {
        t6 = $[13];
    }
    let t7;
    if ($[14] !== t6) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-64 shrink-0 glass-card m-2 ml-0 flex flex-col overflow-hidden",
            children: [
                t5,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 overflow-y-auto p-3 flex flex-col gap-2",
                    children: t6
                }, void 0, false, {
                    fileName: "[project]/src/components/RemindersSidebar.tsx",
                    lineNumber: 144,
                    columnNumber: 95
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RemindersSidebar.tsx",
            lineNumber: 144,
            columnNumber: 10
        }, this);
        $[14] = t6;
        $[15] = t7;
    } else {
        t7 = $[15];
    }
    return t7;
}
_s(RemindersSidebar, "Bmqg7eYHNbHHUVDd9tVkj3ZnFkM=");
_c = RemindersSidebar;
var _c;
__turbopack_context__.k.register(_c, "RemindersSidebar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/modals/Modal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Modal",
    ()=>Modal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function Modal(t0) {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(18);
    if ($[0] !== "f25f4756ba41df4d57b89055118e394ffaa205a7c2180b8273d14c2d85e66b94") {
        for(let $i = 0; $i < 18; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "f25f4756ba41df4d57b89055118e394ffaa205a7c2180b8273d14c2d85e66b94";
    }
    const { isOpen, onClose, title, children } = t0;
    let t1;
    let t2;
    if ($[1] !== onClose) {
        t1 = ({
            "Modal[useEffect()]": ()=>{
                const handler = {
                    "Modal[useEffect() > handler]": (e)=>{
                        if (e.key === "Escape") {
                            onClose();
                        }
                    }
                }["Modal[useEffect() > handler]"];
                window.addEventListener("keydown", handler);
                return ()=>window.removeEventListener("keydown", handler);
            }
        })["Modal[useEffect()]"];
        t2 = [
            onClose
        ];
        $[1] = onClose;
        $[2] = t1;
        $[3] = t2;
    } else {
        t1 = $[2];
        t2 = $[3];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(t1, t2);
    if (!isOpen) {
        return null;
    }
    let t3;
    if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "absolute inset-0 bg-black/60 backdrop-blur-sm"
        }, void 0, false, {
            fileName: "[project]/src/components/modals/Modal.tsx",
            lineNumber: 55,
            columnNumber: 10
        }, this);
        $[4] = t3;
    } else {
        t3 = $[4];
    }
    let t4;
    if ($[5] !== title) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
            className: "text-lg font-bold text-Text",
            children: title
        }, void 0, false, {
            fileName: "[project]/src/components/modals/Modal.tsx",
            lineNumber: 62,
            columnNumber: 10
        }, this);
        $[5] = title;
        $[6] = t4;
    } else {
        t4 = $[6];
    }
    let t5;
    if ($[7] !== onClose) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            onClick: onClose,
            className: "text-Text/40 hover:text-Text transition-colors text-xl leading-none",
            "aria-label": "Lukk",
            children: "×"
        }, void 0, false, {
            fileName: "[project]/src/components/modals/Modal.tsx",
            lineNumber: 70,
            columnNumber: 10
        }, this);
        $[7] = onClose;
        $[8] = t5;
    } else {
        t5 = $[8];
    }
    let t6;
    if ($[9] !== t4 || $[10] !== t5) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex justify-between items-center mb-5",
            children: [
                t4,
                t5
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/modals/Modal.tsx",
            lineNumber: 78,
            columnNumber: 10
        }, this);
        $[9] = t4;
        $[10] = t5;
        $[11] = t6;
    } else {
        t6 = $[11];
    }
    let t7;
    if ($[12] !== children || $[13] !== t6) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "relative glass-card p-6 w-full max-w-md shadow-2xl",
            onClick: _ModalDivOnClick,
            children: [
                t6,
                children
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/modals/Modal.tsx",
            lineNumber: 87,
            columnNumber: 10
        }, this);
        $[12] = children;
        $[13] = t6;
        $[14] = t7;
    } else {
        t7 = $[14];
    }
    let t8;
    if ($[15] !== onClose || $[16] !== t7) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "fixed inset-0 z-50 flex items-center justify-center p-4",
            onClick: onClose,
            children: [
                t3,
                t7
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/modals/Modal.tsx",
            lineNumber: 96,
            columnNumber: 10
        }, this);
        $[15] = onClose;
        $[16] = t7;
        $[17] = t8;
    } else {
        t8 = $[17];
    }
    return t8;
}
_s(Modal, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = Modal;
function _ModalDivOnClick(e_0) {
    return e_0.stopPropagation();
}
var _c;
__turbopack_context__.k.register(_c, "Modal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/modals/AddPersonModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AddPersonModal",
    ()=>AddPersonModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$modals$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/modals/Modal.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
const COLOR_OPTIONS = [
    '#6c63ff',
    '#ef5350',
    '#29b6f6',
    '#ff6584',
    '#66bb6a',
    '#ffa726',
    '#ab47bc',
    '#26c6da'
];
function AddPersonModal(t0) {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(39);
    if ($[0] !== "2bda4d7f77587dfadde9b0fb8563f79db8e1da40fe2745d086e758e95aacae0a") {
        for(let $i = 0; $i < 39; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "2bda4d7f77587dfadde9b0fb8563f79db8e1da40fe2745d086e758e95aacae0a";
    }
    const { isOpen, onClose, onSuccess } = t0;
    const [name, setName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [color, setColor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("#6c63ff");
    const [notes, setNotes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    let t1;
    if ($[1] !== color || $[2] !== name || $[3] !== notes || $[4] !== onClose || $[5] !== onSuccess) {
        t1 = ({
            "AddPersonModal[handleSubmit]": async (e)=>{
                e.preventDefault();
                if (!name.trim()) {
                    return;
                }
                setLoading(true);
                setError("");
                const res = await fetch("/api/persons", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: name.trim(),
                        color,
                        notes
                    })
                });
                setLoading(false);
                if (!res.ok) {
                    setError("Noe gikk galt. Pr\xF8v igjen.");
                    return;
                }
                setName("");
                setColor("#6c63ff");
                setNotes("");
                onSuccess();
                onClose();
            }
        })["AddPersonModal[handleSubmit]"];
        $[1] = color;
        $[2] = name;
        $[3] = notes;
        $[4] = onClose;
        $[5] = onSuccess;
        $[6] = t1;
    } else {
        t1 = $[6];
    }
    const handleSubmit = t1;
    let t2;
    if ($[7] !== error) {
        t2 = error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: "text-red-400 text-sm",
            children: error
        }, void 0, false, {
            fileName: "[project]/src/components/modals/AddPersonModal.tsx",
            lineNumber: 75,
            columnNumber: 19
        }, this);
        $[7] = error;
        $[8] = t2;
    } else {
        t2 = $[8];
    }
    let t3;
    if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
            className: "text-sm text-Text/60",
            children: "Navn *"
        }, void 0, false, {
            fileName: "[project]/src/components/modals/AddPersonModal.tsx",
            lineNumber: 83,
            columnNumber: 10
        }, this);
        $[9] = t3;
    } else {
        t3 = $[9];
    }
    let t4;
    if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = ({
            "AddPersonModal[<input>.onChange]": (e_0)=>setName(e_0.target.value)
        })["AddPersonModal[<input>.onChange]"];
        $[10] = t4;
    } else {
        t4 = $[10];
    }
    let t5;
    if ($[11] !== name) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-1.5",
            children: [
                t3,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    value: name,
                    onChange: t4,
                    placeholder: "Jenny Hansen",
                    required: true,
                    className: "bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-Text placeholder:text-Text/30 focus:outline-none focus:border-Accent transition-colors"
                }, void 0, false, {
                    fileName: "[project]/src/components/modals/AddPersonModal.tsx",
                    lineNumber: 99,
                    columnNumber: 53
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/modals/AddPersonModal.tsx",
            lineNumber: 99,
            columnNumber: 10
        }, this);
        $[11] = name;
        $[12] = t5;
    } else {
        t5 = $[12];
    }
    let t6;
    if ($[13] === Symbol.for("react.memo_cache_sentinel")) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
            className: "text-sm text-Text/60",
            children: "Notat (valgfritt)"
        }, void 0, false, {
            fileName: "[project]/src/components/modals/AddPersonModal.tsx",
            lineNumber: 107,
            columnNumber: 10
        }, this);
        $[13] = t6;
    } else {
        t6 = $[13];
    }
    let t7;
    if ($[14] === Symbol.for("react.memo_cache_sentinel")) {
        t7 = ({
            "AddPersonModal[<textarea>.onChange]": (e_1)=>setNotes(e_1.target.value)
        })["AddPersonModal[<textarea>.onChange]"];
        $[14] = t7;
    } else {
        t7 = $[14];
    }
    let t8;
    if ($[15] !== notes) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-1.5",
            children: [
                t6,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                    value: notes,
                    onChange: t7,
                    placeholder: "Vurderer \xE5 flytte til Amsterdam...",
                    rows: 3,
                    className: "bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-Text placeholder:text-Text/30 focus:outline-none focus:border-Accent transition-colors resize-none"
                }, void 0, false, {
                    fileName: "[project]/src/components/modals/AddPersonModal.tsx",
                    lineNumber: 123,
                    columnNumber: 53
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/modals/AddPersonModal.tsx",
            lineNumber: 123,
            columnNumber: 10
        }, this);
        $[15] = notes;
        $[16] = t8;
    } else {
        t8 = $[16];
    }
    let t9;
    if ($[17] === Symbol.for("react.memo_cache_sentinel")) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
            className: "text-sm text-Text/60",
            children: "Farge"
        }, void 0, false, {
            fileName: "[project]/src/components/modals/AddPersonModal.tsx",
            lineNumber: 131,
            columnNumber: 10
        }, this);
        $[17] = t9;
    } else {
        t9 = $[17];
    }
    let t10;
    if ($[18] !== color) {
        t10 = COLOR_OPTIONS.map({
            "AddPersonModal[COLOR_OPTIONS.map()]": (c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    onClick: {
                        "AddPersonModal[COLOR_OPTIONS.map() > <button>.onClick]": ()=>setColor(c)
                    }["AddPersonModal[COLOR_OPTIONS.map() > <button>.onClick]"],
                    className: `w-8 h-8 rounded-full transition-transform ${color === c ? "scale-125 ring-2 ring-white" : "hover:scale-110"}`,
                    style: {
                        backgroundColor: c
                    },
                    "aria-label": `Velg farge ${c}`
                }, c, false, {
                    fileName: "[project]/src/components/modals/AddPersonModal.tsx",
                    lineNumber: 139,
                    columnNumber: 51
                }, this)
        }["AddPersonModal[COLOR_OPTIONS.map()]"]);
        $[18] = color;
        $[19] = t10;
    } else {
        t10 = $[19];
    }
    let t11;
    if ($[20] !== t10) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-2",
            children: [
                t9,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex gap-2 flex-wrap",
                    children: t10
                }, void 0, false, {
                    fileName: "[project]/src/components/modals/AddPersonModal.tsx",
                    lineNumber: 152,
                    columnNumber: 52
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/modals/AddPersonModal.tsx",
            lineNumber: 152,
            columnNumber: 11
        }, this);
        $[20] = t10;
        $[21] = t11;
    } else {
        t11 = $[21];
    }
    let t12;
    if ($[22] !== loading || $[23] !== name) {
        t12 = loading || !name.trim();
        $[22] = loading;
        $[23] = name;
        $[24] = t12;
    } else {
        t12 = $[24];
    }
    const t13 = loading ? "Legger til..." : "Legg til";
    let t14;
    if ($[25] !== t12 || $[26] !== t13) {
        t14 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            type: "submit",
            disabled: t12,
            className: "mt-2 bg-Accent text-Primary font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40",
            children: t13
        }, void 0, false, {
            fileName: "[project]/src/components/modals/AddPersonModal.tsx",
            lineNumber: 170,
            columnNumber: 11
        }, this);
        $[25] = t12;
        $[26] = t13;
        $[27] = t14;
    } else {
        t14 = $[27];
    }
    let t15;
    if ($[28] !== handleSubmit || $[29] !== t11 || $[30] !== t14 || $[31] !== t2 || $[32] !== t5 || $[33] !== t8) {
        t15 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
            onSubmit: handleSubmit,
            className: "flex flex-col gap-4",
            children: [
                t2,
                t5,
                t8,
                t11,
                t14
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/modals/AddPersonModal.tsx",
            lineNumber: 179,
            columnNumber: 11
        }, this);
        $[28] = handleSubmit;
        $[29] = t11;
        $[30] = t14;
        $[31] = t2;
        $[32] = t5;
        $[33] = t8;
        $[34] = t15;
    } else {
        t15 = $[34];
    }
    let t16;
    if ($[35] !== isOpen || $[36] !== onClose || $[37] !== t15) {
        t16 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$modals$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Modal"], {
            isOpen: isOpen,
            onClose: onClose,
            title: "Legg til person",
            children: t15
        }, void 0, false, {
            fileName: "[project]/src/components/modals/AddPersonModal.tsx",
            lineNumber: 192,
            columnNumber: 11
        }, this);
        $[35] = isOpen;
        $[36] = onClose;
        $[37] = t15;
        $[38] = t16;
    } else {
        t16 = $[38];
    }
    return t16;
}
_s(AddPersonModal, "5KdWiXlsqrQ4E+A9kFtxCrXvwsM=");
_c = AddPersonModal;
var _c;
__turbopack_context__.k.register(_c, "AddPersonModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/relationship-colors.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RELATIONSHIP_COLORS",
    ()=>RELATIONSHIP_COLORS,
    "RELATIONSHIP_LABELS",
    ()=>RELATIONSHIP_LABELS,
    "getRelationshipColor",
    ()=>getRelationshipColor
]);
const RELATIONSHIP_COLORS = {
    FRIEND: '#6c63ff',
    FAMILY: '#ef5350',
    COLLEAGUE: '#29b6f6',
    PARTNER: '#ff6584',
    ACQUAINTANCE: '#888888',
    OTHER: '#f9a825'
};
const RELATIONSHIP_LABELS = {
    FRIEND: 'Venn',
    FAMILY: 'Familie',
    COLLEAGUE: 'Kollega',
    PARTNER: 'Partner',
    ACQUAINTANCE: 'Bekjent',
    OTHER: 'Annet'
};
function getRelationshipColor(type) {
    return RELATIONSHIP_COLORS[type];
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/modals/AddRelationshipModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AddRelationshipModal",
    ()=>AddRelationshipModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$modals$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/modals/Modal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$relationship$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/relationship-colors.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
const RELATIONSHIP_TYPES = Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$relationship$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RELATIONSHIP_LABELS"]);
_c = RELATIONSHIP_TYPES;
function AddRelationshipModal(t0) {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(51);
    if ($[0] !== "2ce5c8018dfd218d86781c29403e1ff09f711ad8896929e52037471bf1158d23") {
        for(let $i = 0; $i < 51; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "2ce5c8018dfd218d86781c29403e1ff09f711ad8896929e52037471bf1158d23";
    }
    const { isOpen, onClose, onSuccess } = t0;
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = [];
        $[1] = t1;
    } else {
        t1 = $[1];
    }
    const [persons, setPersons] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(t1);
    const [fromId, setFromId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [toId, setToId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [type, setType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("FRIEND");
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    let t2;
    let t3;
    if ($[2] !== isOpen) {
        t2 = ({
            "AddRelationshipModal[useEffect()]": ()=>{
                if (!isOpen) {
                    return;
                }
                fetch("/api/persons").then(_AddRelationshipModalUseEffectAnonymous).then(setPersons);
            }
        })["AddRelationshipModal[useEffect()]"];
        t3 = [
            isOpen
        ];
        $[2] = isOpen;
        $[3] = t2;
        $[4] = t3;
    } else {
        t2 = $[3];
        t3 = $[4];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(t2, t3);
    let t4;
    if ($[5] !== fromId || $[6] !== onClose || $[7] !== onSuccess || $[8] !== toId || $[9] !== type) {
        t4 = ({
            "AddRelationshipModal[handleSubmit]": async (e)=>{
                e.preventDefault();
                if (!fromId || !toId || fromId === toId) {
                    setError("Velg to forskjellige personer");
                    return;
                }
                setLoading(true);
                setError("");
                const res = await fetch("/api/relationships", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        fromPersonId: fromId,
                        toPersonId: toId,
                        type
                    })
                });
                setLoading(false);
                if (!res.ok) {
                    setError("Noe gikk galt. Pr\xF8v igjen.");
                    return;
                }
                setFromId("");
                setToId("");
                setType("FRIEND");
                onSuccess();
                onClose();
            }
        })["AddRelationshipModal[handleSubmit]"];
        $[5] = fromId;
        $[6] = onClose;
        $[7] = onSuccess;
        $[8] = toId;
        $[9] = type;
        $[10] = t4;
    } else {
        t4 = $[10];
    }
    const handleSubmit = t4;
    let t5;
    if ($[11] !== error) {
        t5 = error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: "text-red-400 text-sm",
            children: error
        }, void 0, false, {
            fileName: "[project]/src/components/modals/AddRelationshipModal.tsx",
            lineNumber: 106,
            columnNumber: 19
        }, this);
        $[11] = error;
        $[12] = t5;
    } else {
        t5 = $[12];
    }
    let t6;
    if ($[13] === Symbol.for("react.memo_cache_sentinel")) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
            className: "text-sm text-Text/60",
            children: "Fra person"
        }, void 0, false, {
            fileName: "[project]/src/components/modals/AddRelationshipModal.tsx",
            lineNumber: 114,
            columnNumber: 10
        }, this);
        $[13] = t6;
    } else {
        t6 = $[13];
    }
    let t7;
    if ($[14] === Symbol.for("react.memo_cache_sentinel")) {
        t7 = ({
            "AddRelationshipModal[<select>.onChange]": (e_0)=>setFromId(e_0.target.value)
        })["AddRelationshipModal[<select>.onChange]"];
        $[14] = t7;
    } else {
        t7 = $[14];
    }
    let t8;
    if ($[15] === Symbol.for("react.memo_cache_sentinel")) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
            value: "",
            children: "Velg person..."
        }, void 0, false, {
            fileName: "[project]/src/components/modals/AddRelationshipModal.tsx",
            lineNumber: 130,
            columnNumber: 10
        }, this);
        $[15] = t8;
    } else {
        t8 = $[15];
    }
    let t9;
    if ($[16] !== persons) {
        t9 = persons.map(_AddRelationshipModalPersonsMap);
        $[16] = persons;
        $[17] = t9;
    } else {
        t9 = $[17];
    }
    let t10;
    if ($[18] !== fromId || $[19] !== t9) {
        t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-1.5",
            children: [
                t6,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                    value: fromId,
                    onChange: t7,
                    className: "bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-Text focus:outline-none focus:border-Accent transition-colors w-full",
                    children: [
                        t8,
                        t9
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/modals/AddRelationshipModal.tsx",
                    lineNumber: 145,
                    columnNumber: 54
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/modals/AddRelationshipModal.tsx",
            lineNumber: 145,
            columnNumber: 11
        }, this);
        $[18] = fromId;
        $[19] = t9;
        $[20] = t10;
    } else {
        t10 = $[20];
    }
    let t11;
    if ($[21] === Symbol.for("react.memo_cache_sentinel")) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
            className: "text-sm text-Text/60",
            children: "Til person"
        }, void 0, false, {
            fileName: "[project]/src/components/modals/AddRelationshipModal.tsx",
            lineNumber: 154,
            columnNumber: 11
        }, this);
        $[21] = t11;
    } else {
        t11 = $[21];
    }
    let t12;
    if ($[22] === Symbol.for("react.memo_cache_sentinel")) {
        t12 = ({
            "AddRelationshipModal[<select>.onChange]": (e_1)=>setToId(e_1.target.value)
        })["AddRelationshipModal[<select>.onChange]"];
        $[22] = t12;
    } else {
        t12 = $[22];
    }
    let t13;
    if ($[23] === Symbol.for("react.memo_cache_sentinel")) {
        t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
            value: "",
            children: "Velg person..."
        }, void 0, false, {
            fileName: "[project]/src/components/modals/AddRelationshipModal.tsx",
            lineNumber: 170,
            columnNumber: 11
        }, this);
        $[23] = t13;
    } else {
        t13 = $[23];
    }
    let t14;
    if ($[24] !== fromId || $[25] !== persons) {
        let t15;
        if ($[27] !== fromId) {
            t15 = ({
                "AddRelationshipModal[persons.filter()]": (p_0)=>p_0.id !== fromId
            })["AddRelationshipModal[persons.filter()]"];
            $[27] = fromId;
            $[28] = t15;
        } else {
            t15 = $[28];
        }
        t14 = persons.filter(t15).map(_AddRelationshipModalAnonymous);
        $[24] = fromId;
        $[25] = persons;
        $[26] = t14;
    } else {
        t14 = $[26];
    }
    let t15;
    if ($[29] !== t14 || $[30] !== toId) {
        t15 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-1.5",
            children: [
                t11,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                    value: toId,
                    onChange: t12,
                    className: "bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-Text focus:outline-none focus:border-Accent transition-colors w-full",
                    children: [
                        t13,
                        t14
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/modals/AddRelationshipModal.tsx",
                    lineNumber: 196,
                    columnNumber: 55
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/modals/AddRelationshipModal.tsx",
            lineNumber: 196,
            columnNumber: 11
        }, this);
        $[29] = t14;
        $[30] = toId;
        $[31] = t15;
    } else {
        t15 = $[31];
    }
    let t16;
    if ($[32] === Symbol.for("react.memo_cache_sentinel")) {
        t16 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
            className: "text-sm text-Text/60",
            children: "Relasjonstype"
        }, void 0, false, {
            fileName: "[project]/src/components/modals/AddRelationshipModal.tsx",
            lineNumber: 205,
            columnNumber: 11
        }, this);
        $[32] = t16;
    } else {
        t16 = $[32];
    }
    let t17;
    if ($[33] !== type) {
        t17 = RELATIONSHIP_TYPES.map({
            "AddRelationshipModal[RELATIONSHIP_TYPES.map()]": (t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    onClick: {
                        "AddRelationshipModal[RELATIONSHIP_TYPES.map() > <button>.onClick]": ()=>setType(t)
                    }["AddRelationshipModal[RELATIONSHIP_TYPES.map() > <button>.onClick]"],
                    className: `px-3 py-1.5 rounded-xl text-sm font-medium transition-all border ${type === t ? "text-Primary border-transparent" : "text-Text/60 border-white/10 hover:border-white/30"}`,
                    style: type === t ? {
                        backgroundColor: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$relationship$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RELATIONSHIP_COLORS"][t]
                    } : {},
                    children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$relationship$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RELATIONSHIP_LABELS"][t]
                }, t, false, {
                    fileName: "[project]/src/components/modals/AddRelationshipModal.tsx",
                    lineNumber: 213,
                    columnNumber: 62
                }, this)
        }["AddRelationshipModal[RELATIONSHIP_TYPES.map()]"]);
        $[33] = type;
        $[34] = t17;
    } else {
        t17 = $[34];
    }
    let t18;
    if ($[35] !== t17) {
        t18 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-2",
            children: [
                t16,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-wrap gap-2",
                    children: t17
                }, void 0, false, {
                    fileName: "[project]/src/components/modals/AddRelationshipModal.tsx",
                    lineNumber: 226,
                    columnNumber: 53
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/modals/AddRelationshipModal.tsx",
            lineNumber: 226,
            columnNumber: 11
        }, this);
        $[35] = t17;
        $[36] = t18;
    } else {
        t18 = $[36];
    }
    const t19 = loading || !fromId || !toId;
    const t20 = loading ? "Legger til..." : "Legg til relasjon";
    let t21;
    if ($[37] !== t19 || $[38] !== t20) {
        t21 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            type: "submit",
            disabled: t19,
            className: "mt-2 bg-Accent text-Primary font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40",
            children: t20
        }, void 0, false, {
            fileName: "[project]/src/components/modals/AddRelationshipModal.tsx",
            lineNumber: 236,
            columnNumber: 11
        }, this);
        $[37] = t19;
        $[38] = t20;
        $[39] = t21;
    } else {
        t21 = $[39];
    }
    let t22;
    if ($[40] !== handleSubmit || $[41] !== t10 || $[42] !== t15 || $[43] !== t18 || $[44] !== t21 || $[45] !== t5) {
        t22 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
            onSubmit: handleSubmit,
            className: "flex flex-col gap-4",
            children: [
                t5,
                t10,
                t15,
                t18,
                t21
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/modals/AddRelationshipModal.tsx",
            lineNumber: 245,
            columnNumber: 11
        }, this);
        $[40] = handleSubmit;
        $[41] = t10;
        $[42] = t15;
        $[43] = t18;
        $[44] = t21;
        $[45] = t5;
        $[46] = t22;
    } else {
        t22 = $[46];
    }
    let t23;
    if ($[47] !== isOpen || $[48] !== onClose || $[49] !== t22) {
        t23 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$modals$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Modal"], {
            isOpen: isOpen,
            onClose: onClose,
            title: "Legg til relasjon",
            children: t22
        }, void 0, false, {
            fileName: "[project]/src/components/modals/AddRelationshipModal.tsx",
            lineNumber: 258,
            columnNumber: 11
        }, this);
        $[47] = isOpen;
        $[48] = onClose;
        $[49] = t22;
        $[50] = t23;
    } else {
        t23 = $[50];
    }
    return t23;
}
_s(AddRelationshipModal, "tlmim6xx53oRNBJJw3pDFGpJ9mc=");
_c1 = AddRelationshipModal;
function _AddRelationshipModalAnonymous(p_1) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
        value: p_1.id,
        children: p_1.name
    }, p_1.id, false, {
        fileName: "[project]/src/components/modals/AddRelationshipModal.tsx",
        lineNumber: 269,
        columnNumber: 10
    }, this);
}
function _AddRelationshipModalPersonsMap(p) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
        value: p.id,
        children: p.name
    }, p.id, false, {
        fileName: "[project]/src/components/modals/AddRelationshipModal.tsx",
        lineNumber: 272,
        columnNumber: 10
    }, this);
}
function _AddRelationshipModalUseEffectAnonymous(r) {
    return r.json();
}
var _c, _c1;
__turbopack_context__.k.register(_c, "RELATIONSHIP_TYPES");
__turbopack_context__.k.register(_c1, "AddRelationshipModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/modals/LogEntryModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LogEntryModal",
    ()=>LogEntryModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$modals$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/modals/Modal.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
const LOG_TYPES = [
    {
        value: 'MET',
        label: 'Møttes',
        emoji: '☕'
    },
    {
        value: 'CALLED',
        label: 'Ringte',
        emoji: '📞'
    },
    {
        value: 'MESSAGE',
        label: 'Melding',
        emoji: '💬'
    },
    {
        value: 'OTHER',
        label: 'Annet',
        emoji: '📝'
    }
];
function LogEntryModal(t0) {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(52);
    if ($[0] !== "f671519a3bfeee5a5a2999435572ad2e97d86788c7c60e4d503dac30ef9f2817") {
        for(let $i = 0; $i < 52; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "f671519a3bfeee5a5a2999435572ad2e97d86788c7c60e4d503dac30ef9f2817";
    }
    const { isOpen, onClose, onSuccess, defaultPersonId } = t0;
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = [];
        $[1] = t1;
    } else {
        t1 = $[1];
    }
    const [persons, setPersons] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(t1);
    const [personId, setPersonId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(defaultPersonId ?? "");
    const [type, setType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("MET");
    const [notes, setNotes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    let t2;
    if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = new Date().toISOString().split("T");
        $[2] = t2;
    } else {
        t2 = $[2];
    }
    const [date, setDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(t2[0]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    let t3;
    let t4;
    if ($[3] !== defaultPersonId || $[4] !== isOpen) {
        t3 = ({
            "LogEntryModal[useEffect()]": ()=>{
                if (!isOpen) {
                    return;
                }
                fetch("/api/persons").then(_LogEntryModalUseEffectAnonymous).then(setPersons);
                if (defaultPersonId) {
                    setPersonId(defaultPersonId);
                }
            }
        })["LogEntryModal[useEffect()]"];
        t4 = [
            isOpen,
            defaultPersonId
        ];
        $[3] = defaultPersonId;
        $[4] = isOpen;
        $[5] = t3;
        $[6] = t4;
    } else {
        t3 = $[5];
        t4 = $[6];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(t3, t4);
    let t5;
    if ($[7] !== date || $[8] !== notes || $[9] !== onClose || $[10] !== onSuccess || $[11] !== personId || $[12] !== type) {
        t5 = ({
            "LogEntryModal[handleSubmit]": async (e)=>{
                e.preventDefault();
                if (!personId) {
                    return;
                }
                setLoading(true);
                setError("");
                const res = await fetch("/api/log", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        personId,
                        type,
                        notes,
                        date
                    })
                });
                setLoading(false);
                if (!res.ok) {
                    setError("Noe gikk galt. Pr\xF8v igjen.");
                    return;
                }
                setNotes("");
                setType("MET");
                onSuccess();
                onClose();
            }
        })["LogEntryModal[handleSubmit]"];
        $[7] = date;
        $[8] = notes;
        $[9] = onClose;
        $[10] = onSuccess;
        $[11] = personId;
        $[12] = type;
        $[13] = t5;
    } else {
        t5 = $[13];
    }
    const handleSubmit = t5;
    let t6;
    if ($[14] !== error) {
        t6 = error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: "text-red-400 text-sm",
            children: error
        }, void 0, false, {
            fileName: "[project]/src/components/modals/LogEntryModal.tsx",
            lineNumber: 139,
            columnNumber: 19
        }, this);
        $[14] = error;
        $[15] = t6;
    } else {
        t6 = $[15];
    }
    let t7;
    if ($[16] === Symbol.for("react.memo_cache_sentinel")) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
            className: "text-sm text-Text/60",
            children: "Person *"
        }, void 0, false, {
            fileName: "[project]/src/components/modals/LogEntryModal.tsx",
            lineNumber: 147,
            columnNumber: 10
        }, this);
        $[16] = t7;
    } else {
        t7 = $[16];
    }
    let t8;
    if ($[17] === Symbol.for("react.memo_cache_sentinel")) {
        t8 = ({
            "LogEntryModal[<select>.onChange]": (e_0)=>setPersonId(e_0.target.value)
        })["LogEntryModal[<select>.onChange]"];
        $[17] = t8;
    } else {
        t8 = $[17];
    }
    let t9;
    if ($[18] === Symbol.for("react.memo_cache_sentinel")) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
            value: "",
            children: "Velg person..."
        }, void 0, false, {
            fileName: "[project]/src/components/modals/LogEntryModal.tsx",
            lineNumber: 163,
            columnNumber: 10
        }, this);
        $[18] = t9;
    } else {
        t9 = $[18];
    }
    let t10;
    if ($[19] !== persons) {
        t10 = persons.map(_LogEntryModalPersonsMap);
        $[19] = persons;
        $[20] = t10;
    } else {
        t10 = $[20];
    }
    let t11;
    if ($[21] !== personId || $[22] !== t10) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-1.5",
            children: [
                t7,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                    value: personId,
                    onChange: t8,
                    required: true,
                    className: "bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-Text focus:outline-none focus:border-Accent transition-colors",
                    children: [
                        t9,
                        t10
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/modals/LogEntryModal.tsx",
                    lineNumber: 178,
                    columnNumber: 54
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/modals/LogEntryModal.tsx",
            lineNumber: 178,
            columnNumber: 11
        }, this);
        $[21] = personId;
        $[22] = t10;
        $[23] = t11;
    } else {
        t11 = $[23];
    }
    let t12;
    if ($[24] === Symbol.for("react.memo_cache_sentinel")) {
        t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
            className: "text-sm text-Text/60",
            children: "Type"
        }, void 0, false, {
            fileName: "[project]/src/components/modals/LogEntryModal.tsx",
            lineNumber: 187,
            columnNumber: 11
        }, this);
        $[24] = t12;
    } else {
        t12 = $[24];
    }
    let t13;
    if ($[25] !== type) {
        t13 = LOG_TYPES.map({
            "LogEntryModal[LOG_TYPES.map()]": (t14)=>{
                const { value, label, emoji } = t14;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    onClick: {
                        "LogEntryModal[LOG_TYPES.map() > <button>.onClick]": ()=>setType(value)
                    }["LogEntryModal[LOG_TYPES.map() > <button>.onClick]"],
                    className: `flex-1 py-2 rounded-xl text-sm font-medium transition-all border ${type === value ? "bg-Accent/20 border-Accent text-Accent" : "border-white/10 text-Text/60 hover:border-white/30"}`,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: emoji
                        }, void 0, false, {
                            fileName: "[project]/src/components/modals/LogEntryModal.tsx",
                            lineNumber: 203,
                            columnNumber: 260
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: label
                        }, void 0, false, {
                            fileName: "[project]/src/components/modals/LogEntryModal.tsx",
                            lineNumber: 203,
                            columnNumber: 278
                        }, this)
                    ]
                }, value, true, {
                    fileName: "[project]/src/components/modals/LogEntryModal.tsx",
                    lineNumber: 201,
                    columnNumber: 16
                }, this);
            }
        }["LogEntryModal[LOG_TYPES.map()]"]);
        $[25] = type;
        $[26] = t13;
    } else {
        t13 = $[26];
    }
    let t14;
    if ($[27] !== t13) {
        t14 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-2",
            children: [
                t12,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex gap-2",
                    children: t13
                }, void 0, false, {
                    fileName: "[project]/src/components/modals/LogEntryModal.tsx",
                    lineNumber: 213,
                    columnNumber: 53
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/modals/LogEntryModal.tsx",
            lineNumber: 213,
            columnNumber: 11
        }, this);
        $[27] = t13;
        $[28] = t14;
    } else {
        t14 = $[28];
    }
    let t15;
    if ($[29] === Symbol.for("react.memo_cache_sentinel")) {
        t15 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
            className: "text-sm text-Text/60",
            children: "Dato"
        }, void 0, false, {
            fileName: "[project]/src/components/modals/LogEntryModal.tsx",
            lineNumber: 221,
            columnNumber: 11
        }, this);
        $[29] = t15;
    } else {
        t15 = $[29];
    }
    let t16;
    if ($[30] === Symbol.for("react.memo_cache_sentinel")) {
        t16 = ({
            "LogEntryModal[<input>.onChange]": (e_1)=>setDate(e_1.target.value)
        })["LogEntryModal[<input>.onChange]"];
        $[30] = t16;
    } else {
        t16 = $[30];
    }
    let t17;
    if ($[31] !== date) {
        t17 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-1.5",
            children: [
                t15,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    type: "date",
                    value: date,
                    onChange: t16,
                    className: "bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-Text focus:outline-none focus:border-Accent transition-colors"
                }, void 0, false, {
                    fileName: "[project]/src/components/modals/LogEntryModal.tsx",
                    lineNumber: 237,
                    columnNumber: 55
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/modals/LogEntryModal.tsx",
            lineNumber: 237,
            columnNumber: 11
        }, this);
        $[31] = date;
        $[32] = t17;
    } else {
        t17 = $[32];
    }
    let t18;
    if ($[33] === Symbol.for("react.memo_cache_sentinel")) {
        t18 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
            className: "text-sm text-Text/60",
            children: "Notat (valgfritt)"
        }, void 0, false, {
            fileName: "[project]/src/components/modals/LogEntryModal.tsx",
            lineNumber: 245,
            columnNumber: 11
        }, this);
        $[33] = t18;
    } else {
        t18 = $[33];
    }
    let t19;
    if ($[34] === Symbol.for("react.memo_cache_sentinel")) {
        t19 = ({
            "LogEntryModal[<textarea>.onChange]": (e_2)=>setNotes(e_2.target.value)
        })["LogEntryModal[<textarea>.onChange]"];
        $[34] = t19;
    } else {
        t19 = $[34];
    }
    let t20;
    if ($[35] !== notes) {
        t20 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-1.5",
            children: [
                t18,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                    value: notes,
                    onChange: t19,
                    placeholder: "Vi snakket om...",
                    rows: 3,
                    className: "bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-Text placeholder:text-Text/30 focus:outline-none focus:border-Accent transition-colors resize-none"
                }, void 0, false, {
                    fileName: "[project]/src/components/modals/LogEntryModal.tsx",
                    lineNumber: 261,
                    columnNumber: 55
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/modals/LogEntryModal.tsx",
            lineNumber: 261,
            columnNumber: 11
        }, this);
        $[35] = notes;
        $[36] = t20;
    } else {
        t20 = $[36];
    }
    const t21 = loading || !personId;
    const t22 = loading ? "Lagrer..." : "Logg kontakt";
    let t23;
    if ($[37] !== t21 || $[38] !== t22) {
        t23 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            type: "submit",
            disabled: t21,
            className: "mt-2 bg-Accent text-Primary font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40",
            children: t22
        }, void 0, false, {
            fileName: "[project]/src/components/modals/LogEntryModal.tsx",
            lineNumber: 271,
            columnNumber: 11
        }, this);
        $[37] = t21;
        $[38] = t22;
        $[39] = t23;
    } else {
        t23 = $[39];
    }
    let t24;
    if ($[40] !== handleSubmit || $[41] !== t11 || $[42] !== t14 || $[43] !== t17 || $[44] !== t20 || $[45] !== t23 || $[46] !== t6) {
        t24 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
            onSubmit: handleSubmit,
            className: "flex flex-col gap-4",
            children: [
                t6,
                t11,
                t14,
                t17,
                t20,
                t23
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/modals/LogEntryModal.tsx",
            lineNumber: 280,
            columnNumber: 11
        }, this);
        $[40] = handleSubmit;
        $[41] = t11;
        $[42] = t14;
        $[43] = t17;
        $[44] = t20;
        $[45] = t23;
        $[46] = t6;
        $[47] = t24;
    } else {
        t24 = $[47];
    }
    let t25;
    if ($[48] !== isOpen || $[49] !== onClose || $[50] !== t24) {
        t25 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$modals$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Modal"], {
            isOpen: isOpen,
            onClose: onClose,
            title: "Logg kontakt",
            children: t24
        }, void 0, false, {
            fileName: "[project]/src/components/modals/LogEntryModal.tsx",
            lineNumber: 294,
            columnNumber: 11
        }, this);
        $[48] = isOpen;
        $[49] = onClose;
        $[50] = t24;
        $[51] = t25;
    } else {
        t25 = $[51];
    }
    return t25;
}
_s(LogEntryModal, "31RMb49URImWG1l2uLYXrRY653Y=");
_c = LogEntryModal;
function _LogEntryModalPersonsMap(p) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
        value: p.id,
        children: p.name
    }, p.id, false, {
        fileName: "[project]/src/components/modals/LogEntryModal.tsx",
        lineNumber: 305,
        columnNumber: 10
    }, this);
}
function _LogEntryModalUseEffectAnonymous(r) {
    return r.json();
}
var _c;
__turbopack_context__.k.register(_c, "LogEntryModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HomePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/react.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$graph$2f$VennekartCanvas$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/graph/VennekartCanvas.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TimelineStripe$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/TimelineStripe.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$RemindersSidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/RemindersSidebar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$modals$2f$AddPersonModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/modals/AddPersonModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$modals$2f$AddRelationshipModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/modals/AddRelationshipModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$modals$2f$LogEntryModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/modals/LogEntryModal.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
function HomePage() {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(29);
    if ($[0] !== "f2b8378a2702d2a8730231cb5ab6b3dfd525dd78b198fcd90378301c79b9e897") {
        for(let $i = 0; $i < 29; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "f2b8378a2702d2a8730231cb5ab6b3dfd525dd78b198fcd90378301c79b9e897";
    }
    const { data: session, status } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSession"])();
    const [refreshKey, setRefreshKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    let t0;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = ({
            "HomePage[refresh]": ()=>setRefreshKey(_HomePageRefreshSetRefreshKey)
        })["HomePage[refresh]"];
        $[1] = t0;
    } else {
        t0 = $[1];
    }
    const refresh = t0;
    const [addPersonOpen, setAddPersonOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [addRelationshipOpen, setAddRelationshipOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [logEntryOpen, setLogEntryOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [logEntryPersonId, setLogEntryPersonId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])();
    let t1;
    if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = ({
            "HomePage[handleAddLog]": (personId)=>{
                setLogEntryPersonId(personId);
                setLogEntryOpen(true);
            }
        })["HomePage[handleAddLog]"];
        $[2] = t1;
    } else {
        t1 = $[2];
    }
    const handleAddLog = t1;
    if (status === "loading") {
        let t2;
        if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
            t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-center h-[80vh]",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-Text/40",
                    children: "Laster..."
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 55,
                    columnNumber: 71
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 55,
                columnNumber: 12
            }, this);
            $[3] = t2;
        } else {
            t2 = $[3];
        }
        return t2;
    }
    if (!session) {
        let t2;
        if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
            t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col items-center justify-center h-[80vh] gap-6 text-center px-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-5xl font-bold text-Accent",
                        children: "Vennekart"
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 65,
                        columnNumber: 103
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-Text/60 max-w-sm",
                        children: "Din personlige sosiale relasjonsdagbok. Hold oversikt over vennene dine, logg kontakt og få påminnelser."
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 65,
                        columnNumber: 164
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: _HomePageButtonOnClick,
                        className: "bg-Accent text-Primary font-bold px-8 py-4 rounded-2xl text-lg hover:opacity-90 transition-opacity shadow-lg shadow-Accent/30",
                        children: "Kom i gang med Google"
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 65,
                        columnNumber: 309
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 65,
                columnNumber: 12
            }, this);
            $[4] = t2;
        } else {
            t2 = $[4];
        }
        return t2;
    }
    let t2;
    if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = ({
            "HomePage[<TimelineStripe>.onAddLog]": ()=>handleAddLog(undefined)
        })["HomePage[<TimelineStripe>.onAddLog]"];
        $[5] = t2;
    } else {
        t2 = $[5];
    }
    let t3;
    if ($[6] !== refreshKey) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TimelineStripe$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TimelineStripe"], {
            refreshKey: refreshKey,
            onAddLog: t2
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 83,
            columnNumber: 10
        }, this);
        $[6] = refreshKey;
        $[7] = t3;
    } else {
        t3 = $[7];
    }
    let t4;
    if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = {
            height: "calc(100vh - 140px)"
        };
        $[8] = t4;
    } else {
        t4 = $[8];
    }
    let t5;
    let t6;
    if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
        t5 = ({
            "HomePage[<VennekartCanvas>.onAddPerson]": ()=>setAddPersonOpen(true)
        })["HomePage[<VennekartCanvas>.onAddPerson]"];
        t6 = ({
            "HomePage[<VennekartCanvas>.onAddRelationship]": ()=>setAddRelationshipOpen(true)
        })["HomePage[<VennekartCanvas>.onAddRelationship]"];
        $[9] = t5;
        $[10] = t6;
    } else {
        t5 = $[9];
        t6 = $[10];
    }
    let t7;
    if ($[11] !== refreshKey) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex mx-4 mt-2 gap-0",
            style: t4,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$graph$2f$VennekartCanvas$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VennekartCanvas"], {
                    onAddPerson: t5,
                    onAddRelationship: t6,
                    onAddLog: handleAddLog,
                    refreshKey: refreshKey
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 115,
                    columnNumber: 59
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$RemindersSidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RemindersSidebar"], {
                    refreshKey: refreshKey
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 115,
                    columnNumber: 166
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 115,
            columnNumber: 10
        }, this);
        $[11] = refreshKey;
        $[12] = t7;
    } else {
        t7 = $[12];
    }
    let t8;
    if ($[13] === Symbol.for("react.memo_cache_sentinel")) {
        t8 = ({
            "HomePage[<AddPersonModal>.onClose]": ()=>setAddPersonOpen(false)
        })["HomePage[<AddPersonModal>.onClose]"];
        $[13] = t8;
    } else {
        t8 = $[13];
    }
    let t9;
    if ($[14] !== addPersonOpen) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$modals$2f$AddPersonModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AddPersonModal"], {
            isOpen: addPersonOpen,
            onClose: t8,
            onSuccess: refresh
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 132,
            columnNumber: 10
        }, this);
        $[14] = addPersonOpen;
        $[15] = t9;
    } else {
        t9 = $[15];
    }
    let t10;
    if ($[16] === Symbol.for("react.memo_cache_sentinel")) {
        t10 = ({
            "HomePage[<AddRelationshipModal>.onClose]": ()=>setAddRelationshipOpen(false)
        })["HomePage[<AddRelationshipModal>.onClose]"];
        $[16] = t10;
    } else {
        t10 = $[16];
    }
    let t11;
    if ($[17] !== addRelationshipOpen) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$modals$2f$AddRelationshipModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AddRelationshipModal"], {
            isOpen: addRelationshipOpen,
            onClose: t10,
            onSuccess: refresh
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 149,
            columnNumber: 11
        }, this);
        $[17] = addRelationshipOpen;
        $[18] = t11;
    } else {
        t11 = $[18];
    }
    let t12;
    if ($[19] === Symbol.for("react.memo_cache_sentinel")) {
        t12 = ({
            "HomePage[<LogEntryModal>.onClose]": ()=>setLogEntryOpen(false)
        })["HomePage[<LogEntryModal>.onClose]"];
        $[19] = t12;
    } else {
        t12 = $[19];
    }
    let t13;
    if ($[20] !== logEntryOpen || $[21] !== logEntryPersonId) {
        t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$modals$2f$LogEntryModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LogEntryModal"], {
            isOpen: logEntryOpen,
            onClose: t12,
            onSuccess: refresh,
            defaultPersonId: logEntryPersonId
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 166,
            columnNumber: 11
        }, this);
        $[20] = logEntryOpen;
        $[21] = logEntryPersonId;
        $[22] = t13;
    } else {
        t13 = $[22];
    }
    let t14;
    if ($[23] !== t11 || $[24] !== t13 || $[25] !== t3 || $[26] !== t7 || $[27] !== t9) {
        t14 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                t3,
                t7,
                t9,
                t11,
                t13
            ]
        }, void 0, true);
        $[23] = t11;
        $[24] = t13;
        $[25] = t3;
        $[26] = t7;
        $[27] = t9;
        $[28] = t14;
    } else {
        t14 = $[28];
    }
    return t14;
}
_s(HomePage, "NJfRItAaMWvU9oYa2VErMVmJMOs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSession"]
    ];
});
_c = HomePage;
function _HomePageButtonOnClick() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["signIn"])("google");
}
function _HomePageRefreshSetRefreshKey(k) {
    return k + 1;
}
var _c;
__turbopack_context__.k.register(_c, "HomePage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_1c14febe._.js.map