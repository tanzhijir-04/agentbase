#!/usr/bin/env python3
import math, random, os
from PIL import Image, ImageDraw, ImageFont

W, H = 1536, 1024
WHITE = (255, 255, 255)
BLACK = (30, 30, 30)
RED = (210, 50, 50)
ORANGE = (230, 130, 30)
BLUE = (50, 100, 200)
GREEN = (50, 160, 50)

def get_font(size):
    for fp in ["C:/Windows/Fonts/msyh.ttc", "C:/Windows/Fonts/simhei.ttf"]:
        if os.path.exists(fp):
            try:
                return ImageFont.truetype(fp, size)
            except:
                pass
    return ImageFont.load_default()

def wline(draw, pts, color=BLACK, width=2):
    for i in range(len(pts)-1):
        x1,y1 = pts[i]; x2,y2 = pts[i+1]
        steps = max(int(math.hypot(x2-x1,y2-y1)/3),1)
        pp = []
        for s in range(steps+1):
            t = s/steps
            pp.append((x1+(x2-x1)*t+random.uniform(-1.5,1.5), y1+(y2-y1)*t+random.uniform(-1.5,1.5)))
        for j in range(len(pp)-1):
            draw.line([pp[j],pp[j+1]], fill=color, width=width)

def wrect(draw, x, y, w, h, color=BLACK, width=2):
    wline(draw, [(x,y),(x+w,y),(x+w,y+h),(x,y+h),(x,y)], color, width)

def wcirc(draw, cx, cy, r, color=BLACK, width=2):
    pts = [(cx+r*math.cos(i*10*math.pi/180)+random.uniform(-1.5,1.5), cy+r*math.sin(i*10*math.pi/180)+random.uniform(-1.5,1.5)) for i in range(37)]
    pts.append(pts[0])
    wline(draw, pts, color, width)

def xh(draw, cx, cy, sz=40):
    bw,bh = sz*0.7,sz*0.8
    bp = [(cx+bw*math.cos(i*(360.0/25)*math.pi/180)+random.uniform(-1,1), cy+bh*math.sin(i*(360.0/25)*math.pi/180)+random.uniform(-1,1)) for i in range(25)]
    bp.append(bp[0])
    draw.polygon(bp, fill=BLACK)
    ey=cy-sz*0.15; eo=sz*0.2; er=sz*0.08
    draw.ellipse([cx-eo-er,ey-er,cx-eo+er,ey+er], fill=WHITE)
    draw.ellipse([cx+eo-er,ey-er,cx+eo+er,ey+er], fill=WHITE)
    lb=cy+bh+sz*0.35; ly=cy+bh*0.6
    for lo in [-sz*0.25,sz*0.25]:
        wline(draw, [(cx+lo,ly),(cx+lo+random.uniform(-2,2),lb)], BLACK, 2)

def xha(draw, cx, cy, sz=40, d="right"):
    xh(draw, cx, cy, sz)
    ay=cy-sz*0.1
    if d=="right": e=(cx+sz*1.2,ay+random.uniform(-5,5))
    elif d=="left": e=(cx-sz*1.2,ay+random.uniform(-5,5))
    elif d=="up": e=(cx+sz*0.3,cy-sz*1.3)
    else: e=(cx+sz*0.3,cy+sz*1.0)
    wline(draw, [(cx+sz*0.4,ay),e], BLACK, 2)

def ann(draw, x, y, text, color=RED, size=22):
    draw.text((x,y), text, fill=color, font=get_font(size))

def arr(draw, x1, y1, x2, y2, color=ORANGE, width=3):
    wline(draw, [(x1,y1),(x2,y2)], color, width)
    a = math.atan2(y2-y1,x2-x1)
    for da in [0.4,-0.4]:
        wline(draw, [(x2,y2),(x2-15*math.cos(a+da),y2-15*math.sin(a+da))], color, width)

def g01():
    random.seed(42); img=Image.new("RGB",(W,H),WHITE); d=ImageDraw.Draw(img)
    for _ in range(12):
        x1=random.randint(80,550); y1=random.randint(200,750)
        wline(d,[(x1,y1),(x1+random.randint(-150,150),y1+random.randint(-150,150))],BLACK,1)
    ann(d,100,280,"memory",RED,20); ann(d,200,500,"retrieval",RED,20); ann(d,350,350,"tools",RED,20)
    ann(d,150,650,"observability",RED,18); ann(d,400,600,"multi-turn",RED,18)
    xh(d,350,480,45); ann(d,280,200,"every time from scratch",RED,24)
    arr(d,620,512,880,512,ORANGE,4)
    for lb,bx,by in [("Prompt",950,300),("LLM",1100,300),("Memory",950,500),("Tool",1100,500)]:
        wrect(d,bx,by,120,60,BLACK,2); ann(d,bx+25,by+15,lb,BLACK,20)
    arr(d,1070,330,1100,330,ORANGE,2); arr(d,1010,360,1010,500,ORANGE,2)
    xha(d,1280,450,40,"left"); ann(d,950,200,"unified interface",BLUE,22); ann(d,1100,650,"pluggable",ORANGE,22)
    return img

def g02():
    random.seed(43); img=Image.new("RGB",(W,H),WHITE); d=ImageDraw.Draw(img)
    boxes=[("input",200,400),("Prompt",500,400),("LLM",800,400),("Parser",1100,400)]
    for lb,bx,by in boxes:
        wrect(d,bx,by,150,80,BLACK,2); ann(d,bx+30,by+25,lb,BLACK,22)
    for i in range(3):
        x1=boxes[i][1]+150; x2=boxes[i+1][1]; y=boxes[i][2]+40
        wline(d,[(x1,y),(x2,y)],ORANGE,3); ann(d,(x1+x2)//2-8,y-30,"|",ORANGE,28)
    xha(d,670,320,38,"down"); ann(d,200,350,"dict",BLUE,18); ann(d,530,530,"msg list",BLUE,18)
    ann(d,830,530,"AIMessage",BLUE,18); ann(d,1120,530,"string",BLUE,18)
    arr(d,1250,440,1400,440,ORANGE,3); ann(d,1380,410,"result",ORANGE,22)
    ann(d,550,150,"LCEL pipe: each | is a joint",RED,26)
    xh(d,380,550,35); ann(d,300,610,"Runnable",BLACK,18)
    return img

def g03():
    random.seed(44); img=Image.new("RGB",(W,H),WHITE); d=ImageDraw.Draw(img)
    wrect(d,400,300,700,400,BLACK,2)
    for cx,cy in [(500,450),(700,450),(900,450)]: wcirc(d,cx,cy,40,BLACK,2)
    wrect(d,610,350,180,100,RED,2); ann(d,630,370,"LLM slot",RED,20)
    xha(d,700,280,45,"down")
    wcirc(d,300,200,35,BLACK,2); ann(d,260,240,"GPT-4",BLACK,20)
    wcirc(d,1200,200,35,BLACK,2); ann(d,1150,240,"Claude",BLACK,20)
    arr(d,320,230,620,370,ORANGE,2); arr(d,1180,230,800,370,ORANGE,2)
    ann(d,450,150,"change one line, rest stays",RED,26)
    ann(d,480,510,"Prompt",BLUE,18); ann(d,680,510,"Memory",BLUE,18); ann(d,880,510,"Tool",BLUE,18)
    ann(d,550,750,"unified interface, swappable parts",ORANGE,22)
    return img
def g04():
    random.seed(45); img=Image.new("RGB",(W,H),WHITE); d=ImageDraw.Draw(img)
    wrect(d,150,350,200,120,BLACK,2); ann(d,190,390,"LLM",BLACK,24); ann(d,180,490,"stateless",RED,20)
    wline(d,[(160,360),(340,460)],RED,2)
    arr(d,420,420,580,420,ORANGE,3); ann(d,440,370,"+ Memory",ORANGE,20)
    wrect(d,620,300,250,150,BLACK,2); ann(d,660,340,"LLM + Memory",BLACK,22)
    for i,msg in enumerate(["user: I am XiaoMing","AI: Hi XiaoMing!","user: What is my name?"]):
        y=500+i*35; wrect(d,670,y,150,28,BLUE,1); ann(d,680,y+3,msg,BLUE,14)
    arr(d,745,500,745,450,ORANGE,2); ann(d,760,510,"inject history",ORANGE,18)
    xha(d,580,580,40,"right"); ann(d,480,630,"memory keeper",BLACK,18)
    ann(d,350,150,"LLM cant remember -> needs external memory",RED,24)
    return img

def g05():
    random.seed(46); img=Image.new("RGB",(W,H),WHITE); d=ImageDraw.Draw(img)
    steps=[("Load",100,400,"PDF\nWeb\nFile"),("Split",400,400,"500ch\noverlap200"),("Embed",700,400,"vector\nstore"),("Retrieve",1000,400,"Top-K\nsearch")]
    for i,(lb,x,y,desc) in enumerate(steps):
        wrect(d,x,y,180,100,BLACK,2); ann(d,x+50,y+10,lb,BLACK,24); ann(d,x+20,y+50,desc,BLUE,16)
        if i<3: arr(d,x+180,y+50,x+220,y+50,ORANGE,2)
    xha(d,1100,350,40,"down")
    arr(d,100,300,100,400,ORANGE,2); ann(d,30,270,"user question",RED,20)
    arr(d,1180,450,1350,450,ORANGE,2); ann(d,1300,420,"fact-based answer",RED,18)
    ann(d,350,150,"RAG: not memory, but retrieval",RED,26)
    return img

def g06():
    random.seed(47); img=Image.new("RGB",(W,H),WHITE); d=ImageDraw.Draw(img)
    nodes=[("Think",400,300),("Act",750,300),("Observe",575,580)]
    for lb,x,y in nodes:
        wcirc(d,x,y,55,BLACK,2); ann(d,x-25,y-15,lb,BLACK,24)
    arr(d,450,260,700,260,ORANGE,2); arr(d,790,350,630,540,ORANGE,2); arr(d,520,560,410,350,ORANGE,2)
    xh(d,575,400,42); ann(d,520,380,"ReAct",RED,22)
    arr(d,200,300,340,300,ORANGE,2); ann(d,120,270,"user input",BLACK,20)
    arr(d,575,640,575,750,ORANGE,2); ann(d,500,730,"until ready to answer",RED,18)
    arr(d,575,750,200,750,ORANGE,2); arr(d,200,750,200,300,ORANGE,2)
    ann(d,200,770,"tool result",BLUE,16)
    ann(d,700,150,"LLM decides next step",RED,22)
    return img

def g07():
    random.seed(48); img=Image.new("RGB",(W,H),WHITE); d=ImageDraw.Draw(img)
    wrect(d,550,380,200,100,RED,2); ann(d,580,410,"Shared State",RED,22)
    nodes=[("NodeA",300,200),("NodeB",800,200),("NodeC",800,550),("NodeD",300,550)]
    for lb,x,y in nodes:
        wrect(d,x,y,120,60,BLACK,2); ann(d,x+20,y+15,lb,BLACK,20)
        cx2=x+60; cy2=y+30
        arr(d,650,430,cx2,cy2,BLUE,1)
        wline(d,[(cx2+5,cy2+5),(645,425)],ORANGE,1)
    arr(d,420,230,800,230,ORANGE,2); arr(d,860,260,860,550,ORANGE,2)
    xha(d,480,400,38,"right")
    ann(d,400,120,"StateGraph: all nodes share one state",RED,24)
    ann(d,100,700,"read=blue",BLUE,18); ann(d,250,700,"write=orange",ORANGE,18)
    return img

def g08():
    random.seed(49); img=Image.new("RGB",(W,H),WHITE); d=ImageDraw.Draw(img)
    wrect(d,200,380,160,80,BLACK,2); ann(d,230,400,"Agent",BLACK,24); ann(d,230,430,"(call LLM)",BLACK,16)
    wcirc(d,550,420,50,RED,2); ann(d,515,405,"need",RED,18); ann(d,520,425,"tool?",RED,18)
    wrect(d,800,280,160,80,BLACK,2); ann(d,830,300,"Execute Tool",BLACK,22)
    wrect(d,800,520,160,80,BLACK,2); ann(d,840,540,"Output",BLACK,22); ann(d,840,570,"(END)",BLACK,16)
    arr(d,360,420,500,420,ORANGE,2)
    arr(d,600,380,800,320,ORANGE,2); ann(d,650,340,"yes",RED,20)
    arr(d,600,460,800,560,ORANGE,2); ann(d,660,500,"no",RED,20)
    arr(d,800,360,550,360,BLUE,2)
    wline(d,[(550,360),(360,380)],BLUE,2); ann(d,550,330,"loop",BLUE,18)
    xh(d,550,300,36)
    ann(d,300,150,"conditional edges: LLM picks the path",RED,24)
    ann(d,200,650,"max N loops then force stop",BLACK,18)
    return img

def g09():
    random.seed(50); img=Image.new("RGB",(W,H),WHITE); d=ImageDraw.Draw(img)
    wrect(d,150,380,180,80,BLACK,2); ann(d,175,400,"Agent proposes",BLACK,20); ann(d,190,430,"delete file",RED,16)
    arr(d,330,420,480,420,ORANGE,2)
    wrect(d,480,350,180,140,RED,3); ann(d,510,370,"PAUSE!",RED,26); ann(d,510,410,"wait for human",RED,18); ann(d,510,450,"interrupt()",BLACK,14)
    xha(d,570,280,42,"down"); ann(d,480,210,"human approves",BLACK,20)
    arr(d,660,380,830,320,ORANGE,2); ann(d,710,330,"approve",RED,18)
    arr(d,660,480,830,550,RED,2); ann(d,720,510,"reject",RED,18)
    wrect(d,830,280,150,70,BLACK,2); ann(d,860,300,"execute",BLACK,20)
    wrect(d,830,520,150,70,BLACK,2); ann(d,870,540,"abort",BLACK,20)
    ann(d,250,150,"Human-in-loop: pause before critical ops",RED,24)
    return img

def g10():
    random.seed(51); img=Image.new("RGB",(W,H),WHITE); d=ImageDraw.Draw(img)
    files=["agent.js","memory.js","plan_mode.js","workflow_engine.js"]
    for i,f in enumerate(files):
        y=250+i*80; wrect(d,100,y,200,50,BLACK,1); ann(d,115,y+12,f,BLACK,18)
    ann(d,130,190,"your code",RED,22)
    targets=["Agent","Memory","Chain","StateGraph"]
    for i,t in enumerate(targets):
        y=250+i*80; arr(d,300,y,600,y,ORANGE,1)
        wrect(d,600,y,200,50,BLUE,1); ann(d,615,y+12,t,BLUE,18)
    ann(d,630,190,"LangChain/LangGraph",BLUE,22)
    xha(d,460,550,42,"right")
    ann(d,300,650,"hand-written -> framework standard",RED,24)
    ann(d,350,700,"two kinds of knowledge complement",ORANGE,20)
    return img

def g11():
    random.seed(52); img=Image.new("RGB",(W,H),WHITE); d=ImageDraw.Draw(img)
    wcirc(d,650,450,70,BLACK,3); ann(d,610,430,"Agent",BLACK,26)
    caps=[("Answer",350,250),("Tools",650,200),("Memory",950,250),("Review",350,650),("Stream",650,700),("Persist",950,650)]
    for lb,x,y in caps:
        wrect(d,x-40,y-20,80,40,BLACK,1); ann(d,x-25,y-10,lb,BLACK,18)
        arr(d,x,y,650,450,ORANGE,1)
    xh(d,650,350,30); ann(d,400,120,"six capabilities of a complete Agent",RED,26)
    return img

def g12():
    random.seed(53); img=Image.new("RGB",(W,H),WHITE); d=ImageDraw.Draw(img)
    steps=["Learn Python","Learn LLM API","Prompt Eng","Memory Mgmt","Tool Calls","Deploy"]
    for i,s in enumerate(steps):
        y=200+i*70; wrect(d,100,y,180,45,BLACK,1); ann(d,110,y+10,s,BLACK,18)
    ann(d,110,150,"traditional",RED,22); ann(d,110,640,"weeks to months",RED,16)
    arr(d,350,450,600,450,ORANGE,3); ann(d,400,400,"low-code platform",ORANGE,20)
    wrect(d,650,300,300,300,BLUE,2); ann(d,700,320,"visual builder",BLUE,22)
    items=["drag & drop Bot","built-in LLM","knowledge base","plugin market","one-click publish"]
    for i,item in enumerate(items): ann(d,680,370+i*40,item,BLACK,18)
    xh(d,800,270,38); ann(d,750,220,"30 min done",RED,20)
    ann(d,350,100,"low-code = visual wrap of these 6 steps",RED,26)
    return img

def g13():
    random.seed(54); img=Image.new("RGB",(W,H),WHITE); d=ImageDraw.Draw(img)
    slabels=[("Register",150,400),("Create",330,300),("Prompt",520,400),("Knowledge",710,300),("Plugins",900,400),("Debug",1090,300),("Publish",1280,400)]
    for i in range(len(slabels)-1):
        x1,y1=slabels[i][1],slabels[i][2]; x2,y2=slabels[i+1][1],slabels[i+1][2]
        arr(d,x1+50,y1,x2-10,y2,ORANGE,2)
    for i,(lb,x,y) in enumerate(slabels):
        wcirc(d,x,y,35,BLACK,2); ann(d,x-20,y-10,lb,BLACK,16); ann(d,x-10,y+40,str(i+1),BLUE,14)
    xh(d,610,380,32); ann(d,500,150,"20 min, zero code, register to publish",RED,24)
    return img

def g14():
    random.seed(55); img=Image.new("RGB",(W,H),WHITE); d=ImageDraw.Draw(img)
    nodes=[("Start",100,400),("Intent",320,400),("Search KB",550,280),("Call API",550,520),("Generate",800,400),("End",1050,400)]
    for lb,x,y in nodes:
        c = RED if lb in ["Start","End"] else BLACK
        wrect(d,x,y,130,55,c,2); ann(d,x+15,y+15,lb,c,18)
    arr(d,230,425,320,425,ORANGE,2)
    arr(d,450,400,550,310,ORANGE,2); arr(d,450,440,550,540,ORANGE,2)
    arr(d,680,310,800,420,ORANGE,2); arr(d,680,540,800,440,ORANGE,2)
    arr(d,930,425,1050,425,ORANGE,2)
    ann(d,480,340,"pre-sales",BLUE,16); ann(d,480,490,"after-sales",BLUE,16)
    xha(d,700,230,38,"down"); ann(d,350,150,"workflow: drag lines, flow executes",RED,24)
    return img

def g15():
    random.seed(56); img=Image.new("RGB",(W,H),WHITE); d=ImageDraw.Draw(img)
    wrect(d,200,200,700,400,BLACK,2)
    d.rectangle([200,200,900,240], fill=(50,50,50)); ann(d,220,210,"Terminal",WHITE,16)
    ann(d,230,270,"> git clone ...dify.git",GREEN,16)
    ann(d,230,310,"> cd dify/docker",GREEN,16)
    ann(d,230,350,"> docker compose up -d",GREEN,16)
    ann(d,230,410,"Running on localhost:3000",BLUE,16)
    xha(d,950,400,42,"left"); ann(d,920,350,"enter!",RED,20)
    arr(d,900,400,1050,400,ORANGE,2)
    wrect(d,1050,300,200,200,BLUE,2); ann(d,1080,340,"Dify UI",BLUE,20)
    ann(d,1080,380,"your data",BLUE,16); ann(d,1080,420,"fully private",BLUE,16)
    ann(d,300,130,"Dify: 3 commands, local deploy",RED,26)
    return img

def g16():
    random.seed(57); img=Image.new("RGB",(W,H),WHITE); d=ImageDraw.Draw(img)
    stages=[("Question",80,400),("Rewrite",280,400),("Search",480,400),("Rerank",680,400),("Prompt",880,400),("LLM",1080,400)]
    for i,(lb,x,y) in enumerate(stages):
        wrect(d,x,y,140,55,BLACK,1); ann(d,x+15,y+15,lb,BLACK,16)
        if i<len(stages)-1: arr(d,x+140,y+28,x+165,y+28,ORANGE,2)
    xh(d,650,300,36)
    wrect(d,400,550,300,100,BLUE,1); ann(d,430,570,"Knowledge Base",BLUE,20); ann(d,430,600,"PDF / Web / Table",BLUE,14)
    arr(d,550,550,550,455,BLUE,1)
    arr(d,1220,428,1380,428,ORANGE,2); ann(d,1340,400,"answer",RED,20)
    ann(d,300,150,"RAG pipeline: every step tunable",RED,24)
    return img

def g17():
    random.seed(58); img=Image.new("RGB",(W,H),WHITE); d=ImageDraw.Draw(img)
    wline(d,[(300,400),(1200,400)],BLACK,3)
    wline(d,[(750,400),(720,480),(780,480),(750,400)],BLACK,3)
    wrect(d,300,300,200,100,BLUE,2); ann(d,360,320,"Coze",BLUE,26); ann(d,330,360,"fast simple cloud",BLUE,16)
    wrect(d,1000,300,200,100,RED,2); ann(d,1065,320,"Dify",RED,26); ann(d,1020,360,"private flexible self-host",RED,16)
    xha(d,750,320,42,"up"); ann(d,710,240,"how to choose?",BLACK,20)
    ann(d,300,500,"personal learn",BLACK,16); ann(d,300,530,"customer bot",BLACK,16); ann(d,300,560,"quick validate",BLACK,16)
    ann(d,1000,500,"enterprise",BLACK,16); ann(d,1000,530,"data security",BLACK,16); ann(d,1000,560,"deep customize",BLACK,16)
    ann(d,400,150,"no best, only best fit",RED,26)
    ann(d,400,680,"best practice: Coze front + Dify back",ORANGE,20)
    return img

def save_all():
    out = r"C:\Users\20300\Desktop\AI-Agent-Study\assets"
    os.makedirs(out, exist_ok=True)
    fns = [
        (g01,"17-langchain-intro-01-glue-vs-compose.png"),
        (g02,"17-langchain-intro-02-lcel-pipe.png"),
        (g03,"17-langchain-intro-03-swappable-parts.png"),
        (g04,"17-langchain-core-01-memory-inject.png"),
        (g05,"17-langchain-core-02-rag-pipeline.png"),
        (g06,"17-langchain-core-03-agent-loop.png"),
        (g07,"17-langgraph-intro-01-stategraph.png"),
        (g08,"17-langgraph-intro-02-conditional-edges.png"),
        (g09,"17-langgraph-intro-03-human-in-loop.png"),
        (g10,"17-practice-01-code-to-framework.png"),
        (g11,"17-practice-02-six-capabilities.png"),
        (g12,"18-lowcode-intro-01-manual-vs-platform.png"),
        (g13,"18-coze-bot-01-seven-steps.png"),
        (g14,"18-coze-advanced-01-workflow.png"),
        (g15,"18-dify-intro-01-docker-deploy.png"),
        (g16,"18-dify-advanced-01-rag-pipeline.png"),
        (g17,"18-coze-vs-dify-01-balance.png"),
    ]
    for gen, fn in fns:
        try:
            img = gen()
            img.save(os.path.join(out, fn), "PNG")
            print("OK:", fn)
        except Exception as e:
            print("FAIL:", fn, "-", e)

if __name__ == "__main__":
    save_all()
