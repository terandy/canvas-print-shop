"""Original room, metres; run with Blender --background --python this_file.py.
All geometry and procedural materials are original; no external assets.
The runtime mesh uses camera-projected baked lighting and an unlit glTF material.
"""
import bpy, math, random, json, os
from pathlib import Path
from mathutils import Vector
random.seed(23)
bpy.context.preferences.filepaths.save_version = 0
ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'assets-source/room-visualiser'
OUT = ROOT / 'public/room-visualiser'
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.unit_settings.scale_length = 1
scene.render.engine = 'CYCLES'
scene.cycles.samples = 96
scene.cycles.bake_type = 'COMBINED'
scene.cycles.use_denoising = True
scene.world.color = (.3,.3,.3)
scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.78,.85,1,1)
scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.22
scene.view_settings.view_transform='Standard'
scene.view_settings.look='None'

def mat(name,color,rough=.7,noise=0):
    m=bpy.data.materials.new(name);m.use_nodes=True
    n=m.node_tree.nodes;p=n.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=rough
    if noise:
        tex=n.new('ShaderNodeTexNoise');tex.inputs['Scale'].default_value=noise;tex.inputs['Detail'].default_value=2
        bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.10;bump.inputs['Distance'].default_value=.002
        m.node_tree.links.new(tex.outputs['Fac'],bump.inputs['Height']);m.node_tree.links.new(bump.outputs['Normal'],p.inputs['Normal'])
    return m
wall=mat('Warm limestone plaster',(.70,.66,.59),.9,95)
fabric=mat('Ivory linen boucle',(.64,.60,.51),.96,180)
cream=mat('Warm cotton',(.83,.77,.66),.92,140)
olive=mat('Moss cushion',(.19,.23,.16),.9,140)
rust=mat('Terracotta cushion',(.38,.17,.105),.9,140)
wood=mat('Natural oak',(.38,.22,.105),.5)
n=wood.node_tree.nodes;links=wood.node_tree.links
tex=n.new('ShaderNodeTexNoise');tex.inputs['Scale'].default_value=4;tex.inputs['Detail'].default_value=2
coord=n.new('ShaderNodeTexCoord');mapping=n.new('ShaderNodeVectorMath');mapping.operation='MULTIPLY';mapping.inputs[1].default_value=(3,60,3)
links.new(coord.outputs['Generated'],mapping.inputs[0]);links.new(mapping.outputs[0],tex.inputs['Vector'])
ramp=n.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].color=(.20,.105,.043,1);ramp.color_ramp.elements[1].color=(.48,.30,.15,1)
links.new(tex.outputs['Fac'],ramp.inputs[0]);links.new(ramp.outputs[0],n.get('Principled BSDF').inputs['Base Color'])
black=mat('Soft charcoal metal',(.035,.038,.033),.4)
pottery=mat('Chalk ceramic',(.78,.73,.62),.82,60)
rugmat=mat('Woven sand rug',(.46,.40,.31),.97,240)
leafmat=mat('Olive foliage',(.12,.18,.075),.8)
stemmat=mat('Branch',(.17,.10,.045),.9)
bookmat=mat('Book ochre',(.39,.25,.12),.8)
meshes=[]
def cube(name,loc,scale,material,bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        mod=o.modifiers.new('Soft tailored edges','BEVEL');mod.width=bevel;mod.segments=3
        bpy.ops.object.modifier_apply(modifier=mod.name)
        mod=o.modifiers.new('Weighted corner normals','WEIGHTED_NORMAL');bpy.ops.object.modifier_apply(modifier=mod.name)
    o.data.materials.append(material);meshes.append(o);return o

def cyl(name,loc,radius,depth,material,vertices=32):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=radius,depth=depth,location=loc);o=bpy.context.object;o.name=name;o.data.materials.append(material)
    bevel=o.modifiers.new('Rounded rims','BEVEL');bevel.width=.012;bevel.segments=2;bpy.ops.object.modifier_apply(modifier=bevel.name)
    for p in o.data.polygons:p.use_smooth=True
    meshes.append(o);return o

def sphere(name,loc,scale,material):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=8,location=loc);o=bpy.context.object;o.name=name;o.scale=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    for p in o.data.polygons:p.use_smooth=True
    o.data.materials.append(material);meshes.append(o);return o

def rod(name,a,b,r,material):
    a,b=Vector(a),Vector(b);o=cyl(name,(a+b)/2,r,(b-a).length,material,12);o.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler();return o

# Back wall y=0; camera faces it from negative y. glTF maps this to +Z.
cube('Wall 6.4m x 3.2m',(0,.08,2.2),(6.4,.16,4.4),wall)
cube('Baseboard',(0,-.025,.06),(6.4,.06,.12),cream,.005)
# Floor boards, tiny joins, varied end offsets.
for i in range(20):
    for j in range(3):
        cube('Oak floor plank',( -3.16+i*.33, -.75-j*1.5-(i%2)*.04,-.045),(.326,1.495,.09),wood,.003)
# Left return and deep window surround outside central display area.
cube('Left return',(-3.22,-1.6,2.2),(.16,3.2,4.4),wall)
# Room openness at right is intentional for light / fixed composition.
cube('Rug',(.08,-1.66,.012),(3.55,2.22,.022),rugmat,.055)
for x in [-1.68,1.84]:
    for y in [-2.5+i*.055 for i in range(32)]:rod('Rug fringe',(x,y,.022),(x+(-.07 if x<0 else .07),y,.022),.0025,cream)
# Sofa width EXACT 2.4m, total back top .88m.
for x in [-.96,.96]:
    for y in [-.30,-.96]:cyl('Sofa oak foot',(x,y,.10),.04,.20,wood,16)
cube('Sofa base',(0,-.65,.30),(2.4,.95,.30),fabric,.095)
cube('Sofa back',(0,-.27,.635),(2.4,.24,.49),fabric,.095)
for x in [-1.075,1.075]:cube('Sofa arm',(x,-.68,.48),(.25,.99,.43),fabric,.10)
for x in [-.67,0,.67]:cube('Seat cushion',(x,-.72,.49),(.65,.73,.20),cream,.072)
for x in [-.68,0,.68]:
    o=cube('Back cushion',(x,-.45,.695),(.66,.21,.40),cream,.075);o.rotation_euler.x=math.radians(-9)
for x,m,angle in [(-.81,olive,-12),(-.37,cream,9),(.82,rust,14)]:
    o=cube('Loose cushion',(x,-.67,.72),(.38,.16,.38),m,.065);o.rotation_euler=(math.radians(-12),math.radians(angle),math.radians(angle))
# Low solid-oak oval coffee table, open space keeps the artwork dominant.
o=cyl('Oval oak table',(.1,-1.96,.38),.59,.075,wood,64);o.scale.y=.67
for x,y in [(-.29,-1.78),(.47,-1.81),(.1,-2.21)]:cyl('Table pedestal',(x,y,.19),.075,.35,wood,20)
o=cube('Art book',(-.02,-1.94,.435),(.30,.23,.035),cream,.004);o.rotation_euler.z=.15
cube('Ochre book',(-.015,-1.945,.461),(.27,.20,.02),bookmat,.003)
cyl('Ceramic bowl',(.34,-1.97,.465),.085,.08,pottery)
# Side table and sculptural vase.
cyl('Side table top',(1.69,-.50,.54),.29,.055,wood,48)
cyl('Side table base',(1.69,-.50,.275),.16,.53,wood,32)
sphere('Vase body',(1.69,-.5,.705),(.105,.105,.15),pottery)
cyl('Vase neck',(1.69,-.5,.825),.041,.12,pottery)
for i in range(5):
    a=(1.69,-.5,.84);b=(1.69+random.uniform(-.16,.16),-.5+random.uniform(-.13,.13),1.13+random.random()*.20)
    rod('Dried stem',a,b,.004,stemmat)
    sphere('Seed head',b,(.015,.023,.07),cream)
# Reading lamp left, warm shade.
cyl('Lamp base',(-1.68,-.27,.03),.23,.04,black)
cyl('Lamp stem',(-1.68,-.27,.87),.014,1.7,black,16)
bpy.ops.mesh.primitive_cone_add(vertices=48,radius1=.28,radius2=.19,depth=.30,location=(-1.68,-.27,1.63))
o=bpy.context.object;o.name='Linen lampshade';o.data.materials.append(cream);meshes.append(o)
# Small olive tree at right.
cyl('Planter',(2.33,-.35,.21),.23,.42,pottery,32)
rod('Olive trunk',(2.33,-.35,.40),(2.32,-.36,1.85),.022,stemmat)
for i in range(14):
    angle=i*2.4;h=.85+i*.067
    a=(2.32,-.36,h);b=(2.32+math.cos(angle)*.32,-.36+math.sin(angle)*.30,h+.24)
    rod('Olive branch',a,b,.006,stemmat)
    for j in range(5):
        t=.25+j*.17;p=Vector(a).lerp(Vector(b),t)
        p.x+=random.uniform(-.07,.07);p.y+=random.uniform(-.07,.07)
        o=sphere('Olive leaf',p,(.026,.085,.015),leafmat);o.rotation_euler=(random.random(),random.random(),angle)

def area(name,loc,power,size,target,color):
    data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size;data.color=color
    o=bpy.data.objects.new(name,data);scene.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
area('Large soft daylight',(-3,-3,4.2),230,4,(0,-.6,1), (1,.91,.78))
area('Cool room fill',(3,-2.5,3),75,3,(0,0,1),(.80,.87,1))
# Fixed orthographic camera is also recorded for the web viewer.
bpy.ops.object.camera_add(location=(2.5,-8,3.1));camera=bpy.context.object;camera.name='Fixed comparison camera'
camera.rotation_euler=(Vector((0,-.4,1.45))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=5.8;scene.camera=camera
scene.render.resolution_x=1500;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
measurements={'units':'metres','sofaWidth':2.4,'sofaTop':.88,'wallWidth':6.4,'wallHeight':4.4,'usableWidth':3.8,'usableBottom':1.1,'usableTop':2.95,'canvasCentreHeight':1.72,'galleryDepthInches':1.5,'camera':{'position':[2.5,3.1,8],'target':[0,1.45,.4],'width':5.8},'demoInches':[72,48],'demoMetres':[1.8288,1.2192]}
(SRC/'measurements.json').write_text(json.dumps(measurements,indent=2)+'\n')
# Preserve editable individual objects / materials / camera before export joins.
bpy.ops.wm.save_as_mainfile(filepath=str(SRC/'living-room.blend'))
# Fixed-view lighting projection retains Cycles' soft light without atlas seams.
import sys
sys.path.insert(0, str(SRC))
from export_room import export_room
export_room(ROOT)
