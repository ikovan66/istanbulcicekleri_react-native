const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const { createRequire } = require('module');

module.exports = function ({ types: t }) {
    return {
        visitor: {
            CallExpression(nodePath, state) {
                if (t.isIdentifier(nodePath.node.callee, { name: 'require' }) && nodePath.node.arguments.length === 1) {
                    const arg = nodePath.node.arguments[0];

                    if (t.isStringLiteral(arg) && arg.value.match(/\.(png|jpg|jpeg|gif|webp)$/i)) {
                        try {
                            const currentFile = state.file.opts.filename;
                            // node_modules içindeki dosyaları da inline edelim mi? Evet.

                            let assetPath;
                            try {
                                const req = createRequire(currentFile);
                                assetPath = req.resolve(arg.value);
                            } catch (e) {
                                // Fallback to manual resolve for relative paths if createRequire doesn't work (unlikely)
                                if (arg.value.startsWith('.')) {
                                    assetPath = path.resolve(path.dirname(currentFile), arg.value);
                                } else {
                                    return; // Cannot resolve
                                }
                            }

                            if (fs.existsSync(assetPath)) {
                                const stats = fs.statSync(assetPath);
                                // 5MB limit
                                if (stats.size > 5 * 1024 * 1024) return;

                                const mimeType = mime.lookup(assetPath) || 'image/png';
                                const data = fs.readFileSync(assetPath).toString('base64');
                                const uri = `data:${mimeType};base64,${data}`;

                                // console.warn(`[Babel Inline] ${path.basename(assetPath)} (${stats.size} bytes)`);

                                // Replacement: { uri: "...", width: 100, height: 100, scale: 1 }
                                nodePath.replaceWith(t.objectExpression([
                                    t.objectProperty(t.identifier('uri'), t.stringLiteral(uri)),
                                    t.objectProperty(t.identifier('width'), t.numericLiteral(100)),
                                    t.objectProperty(t.identifier('height'), t.numericLiteral(100)),
                                    t.objectProperty(t.identifier('scale'), t.numericLiteral(1))
                                ]));
                            }
                        } catch (e) {
                            // Ignore errors silently to not break build
                        }
                    }
                }
            }
        }
    };
};
