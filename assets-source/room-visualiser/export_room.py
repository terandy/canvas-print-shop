"""Export an edited living-room.blend, using its fixed comparison camera.
Run Blender --background --python assets-source/room-visualiser/export_room.py.
Projected lighting is valid only for this camera and 3:2 viewport; no orbit/zoom.
"""
import bpy, json, struct
from pathlib import Path
from bpy_extras.object_utils import world_to_camera_view

def export_room(root):
    out=root/'public/room-visualiser';scene=bpy.context.scene
    scene.render.resolution_x=1800;scene.render.resolution_y=1200;scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='JPEG';scene.render.image_settings.quality=90
    scene.render.filepath=str(out/'room-poster.jpg')
    bpy.ops.render.render(write_still=True)
    image=bpy.data.images.load(str(out/'room-poster.jpg'),check_existing=False)
    meshes=[o for o in scene.objects if o.type=='MESH']
    bpy.ops.object.select_all(action='DESELECT')
    for o in meshes:o.select_set(True)
    bpy.context.view_layer.objects.active=meshes[0];bpy.ops.object.join()
    room=bpy.context.object;room.name='LivingRoom_FixedCameraLighting'
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    uv=room.data.uv_layers.active or room.data.uv_layers.new(name='CameraProjection')
    for loop in room.data.loops:
        point=room.matrix_world @ room.data.vertices[loop.vertex_index].co
        p=world_to_camera_view(scene,scene.camera,point)
        uv.data[loop.index].uv=(p.x,p.y)
    material=bpy.data.materials.new('Fixed camera baked daylight');material.use_nodes=True
    nodes=material.node_tree.nodes;nodes.clear()
    output=nodes.new('ShaderNodeOutputMaterial');emission=nodes.new('ShaderNodeEmission');texture=nodes.new('ShaderNodeTexImage');texture.image=image;texture.extension='EXTEND'
    material.node_tree.links.new(texture.outputs['Color'],emission.inputs['Color']);material.node_tree.links.new(emission.outputs[0],output.inputs[0])
    room.data.materials.clear();room.data.materials.append(material)
    for p in room.data.polygons:p.material_index=0
    bpy.ops.export_scene.gltf(filepath=str(out/'living-room.glb'),export_format='GLB',use_selection=True,export_image_format='JPEG',export_jpeg_quality=90,export_texcoords=True,export_normals=False,export_materials='EXPORT',export_cameras=False,export_lights=False,export_extras=False)
    # The exporter represents emission as black PBR + emissive by default.
    # Explicit unlit material eliminates lighting work and preserves render colours.
    path=out/'living-room.glb';data=path.read_bytes()
    json_length=struct.unpack_from('<I',data,12)[0]
    document=json.loads(data[20:20+json_length])
    for m in document['materials']:
        m['pbrMetallicRoughness']={'baseColorTexture':m.pop('emissiveTexture'),'metallicFactor':0,'roughnessFactor':1}
        m.pop('emissiveFactor',None);m['extensions']={'KHR_materials_unlit':{}}
    document['extensionsUsed']=['KHR_materials_unlit']
    encoded=json.dumps(document,separators=(',',':')).encode();encoded+=b' '*((-len(encoded))%4)
    binary=data[20+json_length:]
    path.write_bytes(struct.pack('<4sII',b'glTF',2,20+len(encoded)+len(binary))+struct.pack('<I4s',len(encoded),b'JSON')+encoded+binary)
    print('ROOM_EXPORT_COMPLETE',str(out/'living-room.glb'))

if __name__=='__main__':
    root=Path(__file__).resolve().parents[2]
    bpy.ops.wm.open_mainfile(filepath=str(root/'assets-source/room-visualiser/living-room.blend'))
    export_room(root)
