#!/usr/bin/env python3
"""Generate illustrations for chapters 10-16 (AI Agent Study)"""
import math, random, os
from PIL import Image, ImageDraw, ImageFont

W, H = 1536, 1024
WHITE = (255, 255, 255)
BLACK = (30, 30, 30)
RED = (210, 50, 50)
ORANGE = (230, 130, 30)
BLUE = (50, 100, 200)

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

# === CHAPTER 10: MCP Unified Interface ===
def g_ch10():
    random.seed(100)
    img = Image.new("RGB", (W, H), WHITE)
    d = ImageDraw.Draw(img)
    # Left side: traditional - XiaoHei tangled in various connectors
    ann(d, 200, 120, "传统: 各不相同", RED, 26)
    xh(d, 320, 480, 45)
    # Tangled mess of different-shaped connectors
    shapes = [
        ("circle", 180, 350, 30), ("square", 250, 300, 50),
        ("triangle", 400, 320, 35), ("hexagon", 150, 500, 28),
        ("diamond", 450, 550, 32), ("star", 300, 600, 30),
    ]
    for sh, sx, sy, sr in shapes:
        if sh == "circle":
            wcirc(d, sx, sy, sr, BLACK, 2)
        elif sh == "square":
            wrect(d, sx-sr//2, sy-sr//2, sr, sr, BLACK, 2)
        elif sh == "triangle":
            wline(d, [(sx,sy-sr),(sx-sr,sy+sr),(sx+sr,sy),(sx,sy-sr)], BLACK, 2)
        elif sh == "hexagon":
            pts = [(sx+sr*math.cos(i*60*math.pi/180), sy+sr*math.sin(i*60*math.pi/180)) for i in range(7)]
            wline(d, pts, BLACK, 2)
        elif sh == "diamond":
            wline(d, [(sx,sy-sr),(sx+sr,sy),(sx,sy+sr),(sx-sr,sy),(sx,sy-sr)], BLACK, 2)
        # cables tangling
        wline(d, [(sx,sy),(320+random.uniform(-20,20),480+random.uniform(-20,20))], BLACK, 1)
    ann(d, 260, 680, "五花八门", ORANGE, 20)
    # Tangled lines around XiaoHei
    for _ in range(8):
        wline(d, [(250+random.randint(0,150), 400+random.randint(-80,80)),
                  (350+random.randint(-50,50), 480+random.randint(-50,50))], BLACK, 1)

    # Arrow from left to right
    arr(d, 580, 512, 750, 512, ORANGE, 4)

    # Right side: MCP - XiaoHei with one clean universal plug
    ann(d, 820, 120, "MCP: 统一标准", BLUE, 26)
    xha(d, 900, 480, 45, "right")
    # One clean universal connector
    wrect(d, 980, 430, 120, 100, BLUE, 3)
    ann(d, 1000, 460, "MCP", BLUE, 24)
    ann(d, 1000, 490, "标准接口", BLUE, 18)
    # Clean single cable
    wline(d, [(940, 480), (980, 480)], BLUE, 3)
    # Right side: one neat port
    wrect(d, 1200, 440, 80, 80, BLUE, 3)
    ann(d, 1215, 470, "工具", BLACK, 20)
    arr(d, 1100, 480, 1200, 480, ORANGE, 3)

    # Many tools neatly connected via MCP
    for i, name in enumerate(["搜索", "数据库", "文件", "API"]):
        ty = 320 + i * 80
        wrect(d, 1300, ty, 100, 45, BLACK, 1)
        ann(d, 1320, ty+12, name, BLACK, 16)
        wline(d, [(1280, 480), (1300, ty+22)], ORANGE, 1)

    ann(d, 700, 700, "一个接口, 接所有工具", ORANGE, 22)
    return img

# === CHAPTER 11: Prompt Injection Protection ===
def g_ch11():
    random.seed(101)
    img = Image.new("RGB", (W, H), WHITE)
    d = ImageDraw.Draw(img)
    ann(d, 500, 80, "Prompt 注入防护", RED, 28)
    # Gate/door
    wrect(d, 500, 250, 200, 400, BLACK, 3)
    # Gate bars
    for gx in range(520, 690, 30):
        wline(d, [(gx, 260), (gx, 640)], BLACK, 2)
    # Gate frame top
    wrect(d, 490, 240, 220, 20, BLACK, 3)
    ann(d, 540, 245, "Agent 大门", BLACK, 18)

    # XiaoHei as gatekeeper, standing guard
    xha(d, 420, 500, 50, "right")
    ann(d, 340, 420, "守卫", BLUE, 20)

    # Attacker on the right trying to slip malicious notes through the gap
    # Attacker figure (simple)
    wcirc(d, 850, 400, 25, BLACK, 2)  # head
    wline(d, [(850, 425), (850, 520)], BLACK, 2)  # body
    wline(d, [(850, 450), (800, 480)], BLACK, 2)  # arm left
    wline(d, [(850, 450), (900, 430)], BLACK, 2)  # arm right reaching
    wline(d, [(850, 520), (820, 600)], BLACK, 2)  # leg left
    wline(d, [(850, 520), (880, 600)], BLACK, 2)  # leg right
    ann(d, 820, 360, "攻击者", RED, 20)

    # Malicious paper notes being slipped through gate gap
    for i, note in enumerate(["忽略指令", "泄露密码", "执行命令"]):
        ny = 350 + i * 80
        wrect(d, 720, ny, 100, 35, RED, 1)
        ann(d, 730, ny+8, note, RED, 14)
        # Arrow from attacker to note
        wline(d, [(830, 430), (770, ny+17)], RED, 1)

    # XiaoHei stomping on a note
    wline(d, [(420, 570), (460, 570)], BLACK, 3)  # foot
    wrect(d, 440, 555, 60, 25, RED, 1)
    ann(d, 445, 558, "注入攻击", RED, 12)

    # Defense labels
    ann(d, 150, 300, "输入过滤", BLUE, 22)
    ann(d, 150, 360, "指令隔离", BLUE, 22)
    ann(d, 150, 420, "最小权限", BLUE, 22)
    # Arrows from labels to gate
    arr(d, 280, 320, 500, 350, ORANGE, 2)
    arr(d, 280, 380, 500, 420, ORANGE, 2)
    arr(d, 280, 440, 500, 490, ORANGE, 2)

    ann(d, 500, 750, "三条防线, 逐层过滤", ORANGE, 24)
    return img

# === CHAPTER 12: Sync vs Async ===
def g_ch12():
    random.seed(102)
    img = Image.new("RGB", (W, H), WHITE)
    d = ImageDraw.Draw(img)

    # Left: Sync - XiaoHei stuck behind a big package
    ann(d, 180, 100, "同步: 阻塞", RED, 26)
    xh(d, 280, 480, 45)
    # Big package blocking XiaoHei
    wrect(d, 310, 380, 180, 200, BLACK, 3)
    ann(d, 340, 450, "长任务", BLACK, 22)
    ann(d, 340, 490, "耗时 60s", RED, 18)
    # XiaoHei looks stuck - sweat drops
    ann(d, 260, 380, "...", BLACK, 24)
    # Blocked path
    wline(d, [(100, 580), (500, 580)], BLACK, 1)
    # X marks showing can't proceed
    wline(d, [(240, 560), (260, 580)], RED, 2)
    wline(d, [(260, 560), (240, 580)], RED, 2)
    ann(d, 160, 620, "动弹不得", RED, 20)
    # Other tasks waiting
    for i in range(3):
        tx = 130 + i * 80
        wrect(d, tx, 700, 60, 30, BLACK, 1)
        ann(d, tx+10, 705, f"任务{i+1}", BLACK, 12)

    # Arrow
    arr(d, 560, 480, 720, 480, ORANGE, 4)

    # Right: Async - XiaoHei puts package on conveyor belt, walks freely
    ann(d, 800, 100, "异步: 非阻塞", BLUE, 26)
    xha(d, 820, 480, 45, "right")
    # Conveyor belt
    wline(d, [(880, 520), (1300, 520)], BLACK, 2)
    # Rollers on conveyor
    for rx in range(900, 1300, 50):
        wcirc(d, rx, 530, 8, BLACK, 1)
    # Package on conveyor
    wrect(d, 1000, 440, 120, 80, BLACK, 2)
    ann(d, 1020, 465, "长任务", BLACK, 18)
    ann(d, 1020, 490, "后台处理", BLUE, 14)
    # Arrow showing conveyor moving
    arr(d, 1060, 560, 1200, 560, ORANGE, 2)
    ann(d, 1100, 570, "队列", ORANGE, 16)
    # XiaoHei walking freely
    ann(d, 780, 560, "继续走!", BLUE, 18)
    # Free path ahead
    wline(d, [(780, 580), (950, 580)], BLUE, 1)
    # Done result at end
    wrect(d, 1250, 440, 80, 60, BLUE, 2)
    ann(d, 1265, 460, "完成", BLUE, 18)

    ann(d, 450, 780, "长任务交给队列, 主流程不等待", ORANGE, 22)
    return img

# === CHAPTER 13: Evaluation Dashboard ===
def g_ch13():
    random.seed(103)
    img = Image.new("RGB", (W, H), WHITE)
    d = ImageDraw.Draw(img)
    ann(d, 500, 80, "Agent 评估仪表盘", RED, 28)

    # Dashboard frame
    wrect(d, 300, 180, 900, 550, BLACK, 2)

    # Five gauges on the dashboard
    gauges = [
        ("完成率", 450, 350, 0.85, BLUE),
        ("准确率", 650, 350, 0.72, BLUE),
        ("幻觉率", 850, 350, 0.15, RED),
        ("轮次", 1050, 350, 0.45, ORANGE),
    ]
    for label, gx, gy, value, color in gauges:
        # Gauge arc (half circle)
        r = 55
        for angle in range(180, 361, 5):
            rad = angle * math.pi / 180
            px = gx + r * math.cos(rad) + random.uniform(-1, 1)
            py = gy + r * math.sin(rad) + random.uniform(-1, 1)
            d.ellipse([px-1, py-1, px+1, py+1], fill=BLACK)
        # Needle
        needle_angle = (180 + value * 180) * math.pi / 180
        nx = gx + (r - 10) * math.cos(needle_angle)
        ny = gy + (r - 10) * math.sin(needle_angle)
        wline(d, [(gx, gy), (nx, ny)], color, 2)
        # Center dot
        wcirc(d, gx, gy, 4, color, 2)
        # Label
        ann(d, gx - 25, gy + 65, label, BLACK, 18)

    # 5th gauge: 耗时 (bottom center)
    gx, gy, value = 750, 550, 0.6
    r = 55
    for angle in range(180, 361, 5):
        rad = angle * math.pi / 180
        px = gx + r * math.cos(rad) + random.uniform(-1, 1)
        py = gy + r * math.sin(rad) + random.uniform(-1, 1)
        d.ellipse([px-1, py-1, px+1, py+1], fill=BLACK)
    needle_angle = (180 + value * 180) * math.pi / 180
    nx = gx + (r - 10) * math.cos(needle_angle)
    ny = gy + (r - 10) * math.sin(needle_angle)
    wline(d, [(gx, gy), (nx, ny)], ORANGE, 2)
    wcirc(d, gx, gy, 4, ORANGE, 2)
    ann(d, gx - 20, gy + 65, "耗时", BLACK, 18)

    # XiaoHei looking at the dashboard
    xha(d, 200, 450, 50, "right")
    ann(d, 120, 380, "效果", BLACK, 20)
    ann(d, 120, 410, "如何?", BLACK, 20)

    # Warning on hallucination gauge
    ann(d, 810, 250, "偏高!", RED, 16)

    ann(d, 450, 800, "五个指标, 一张图看清 Agent 健康度", ORANGE, 22)
    return img

# === CHAPTER 14: Tracing ===
def g_ch14():
    random.seed(104)
    img = Image.new("RGB", (W, H), WHITE)
    d = ImageDraw.Draw(img)
    ann(d, 500, 80, "Tracing 全链路追踪", RED, 28)

    # A curved path from left to right
    path_pts = []
    for i in range(20):
        t = i / 19.0
        px = 150 + t * 1100
        py = 500 + 120 * math.sin(t * math.pi * 2.5) + random.uniform(-3, 3)
        path_pts.append((px, py))
    wline(d, path_pts, BLACK, 3)

    # Step markers along the path with labels
    steps = [
        (0, "收到请求", BLUE),
        (3, "理解意图", BLUE),
        (6, "选择工具", ORANGE),
        (9, "调用API", ORANGE),
        (12, "处理结果", BLUE),
        (15, "生成回复", BLUE),
        (18, "返回", RED),
    ]
    for idx, label, color in steps:
        px, py = path_pts[idx]
        wcirc(d, px, py, 12, color, 2)
        ann(d, px - 25, py - 35, label, color, 14)

    # XiaoHei walking along the path, leaving footprints
    # XiaoHei at current position
    xh(d, path_pts[10][0], path_pts[10][1] - 50, 35)

    # Footprints behind XiaoHei
    for i in range(10):
        fx, fy = path_pts[i]
        # Small footprint marks
        if i % 2 == 0:
            d.ellipse([fx-4, fy-2, fx+2, fy+4], fill=BLACK)
        else:
            d.ellipse([fx-2, fy-2, fx+4, fy+4], fill=BLACK)

    # Time stamps along traces
    for i, t_ms in enumerate(["0ms", "120ms", "350ms", "890ms", "1.2s", "1.5s", "1.6s"]):
        if i < len(steps):
            idx = steps[i][0]
            px, py = path_pts[idx]
            ann(d, px - 15, py + 20, t_ms, ORANGE, 12)

    # Labels
    ann(d, 150, 200, "每一步都留下脚印", BLUE, 22)
    ann(d, 150, 240, "问题可追溯, 性能可度量", ORANGE, 18)

    # XiaoHei at the end looking back at traces
    xha(d, 1300, 400, 40, "left")
    ann(d, 1250, 340, "回看", BLACK, 16)

    ann(d, 400, 780, "没有 Tracing, 出了问题只能猜", RED, 22)
    return img

# === CHAPTER 15: Model Tiering ===
def g_ch15():
    random.seed(105)
    img = Image.new("RGB", (W, H), WHITE)
    d = ImageDraw.Draw(img)
    ann(d, 450, 80, "模型分层选型", RED, 28)

    # XiaoHei as the manager
    xh(d, 700, 300, 50)
    ann(d, 660, 220, "调度员", BLACK, 20)

    # Small robot on the left - handling simple tasks
    # Robot body
    wrect(d, 200, 380, 100, 80, BLACK, 2)
    wcirc(d, 250, 360, 20, BLACK, 2)  # head
    wcirc(d, 240, 355, 4, BLUE, 2)  # eye
    wcirc(d, 260, 355, 4, BLUE, 2)  # eye
    wline(d, [(250, 380), (250, 380)], BLACK, 2)  # neck
    # Robot antenna
    wline(d, [(250, 340), (250, 320)], BLACK, 2)
    wcirc(d, 250, 315, 4, ORANGE, 2)
    ann(d, 190, 300, "小模型", BLUE, 20)
    ann(d, 170, 480, "便宜快速", BLUE, 16)

    # Simple tasks for small model
    for i, task in enumerate(["分类", "提取", "翻译", "摘要"]):
        ty = 520 + i * 40
        wrect(d, 170, ty, 120, 30, BLUE, 1)
        ann(d, 190, ty + 6, task, BLUE, 14)

    # Arrow from manager to small robot
    arr(d, 500, 350, 320, 400, ORANGE, 2)
    ann(d, 370, 360, "简单任务", ORANGE, 16)

    # Big model on the right - handling complex tasks
    wrect(d, 1050, 350, 140, 110, RED, 2)
    wcirc(d, 1120, 330, 30, RED, 2)  # head - bigger
    wcirc(d, 1108, 325, 5, WHITE, 2)
    wcirc(d, 1132, 325, 5, WHITE, 2)
    # Crown/complexity indicator
    wline(d, [(1090, 300), (1100, 290), (1110, 300), (1120, 290), (1130, 300), (1140, 290), (1150, 300)], RED, 2)
    ann(d, 1070, 260, "大模型", RED, 22)
    ann(d, 1060, 480, "强但贵", RED, 16)

    # Complex tasks for big model
    for i, task in enumerate(["推理", "规划", "创造", "决策"]):
        ty = 520 + i * 40
        wrect(d, 1060, ty, 120, 30, RED, 1)
        ann(d, 1080, ty + 6, task, RED, 14)

    # Arrow from manager to big model
    arr(d, 770, 350, 1050, 400, ORANGE, 2)
    ann(d, 870, 360, "复杂任务", ORANGE, 16)

    # Cost comparison
    ann(d, 400, 750, "小模型做 80% 的事, 大模型只做 20%", ORANGE, 22)
    ann(d, 500, 790, "成本降一半, 效果不打折", BLUE, 18)
    return img

# === CHAPTER 16: Agent Service化 ===
def g_ch16():
    random.seed(106)
    img = Image.new("RGB", (W, H), WHITE)
    d = ImageDraw.Draw(img)
    ann(d, 500, 80, "Agent 服务化部署", RED, 28)

    # Left: Complex messy machine (Agent internals)
    ann(d, 150, 150, "内部: 复杂", RED, 22)
    # Gears and components
    for gx, gy, gr in [(250, 350, 40), (350, 300, 35), (300, 450, 30), (400, 400, 25)]:
        # Gear teeth
        for angle in range(0, 360, 45):
            rad = angle * math.pi / 180
            x1 = gx + gr * math.cos(rad)
            y1 = gy + gr * math.sin(rad)
            x2 = gx + (gr + 10) * math.cos(rad)
            y2 = gy + (gr + 10) * math.sin(rad)
            wline(d, [(x1, y1), (x2, y2)], BLACK, 2)
        wcirc(d, gx, gy, gr, BLACK, 2)

    # Labels on components
    ann(d, 200, 300, "LLM", BLACK, 16)
    ann(d, 330, 260, "Memory", BLACK, 14)
    ann(d, 270, 440, "Tools", BLACK, 14)
    ann(d, 380, 380, "RAG", BLACK, 14)
    # Wires connecting everything
    for _ in range(6):
        wline(d, [(220+random.randint(0,200), 300+random.randint(-100,150)),
                  (250+random.randint(0,180), 320+random.randint(-80,120))], BLACK, 1)

    # Arrow: shoving into box
    arr(d, 500, 400, 700, 400, ORANGE, 4)
    ann(d, 520, 360, "封装", ORANGE, 20)

    # Right: Clean box with API label
    ann(d, 850, 150, "对外: 简洁", BLUE, 22)
    wrect(d, 750, 280, 300, 250, BLUE, 3)
    ann(d, 830, 310, "API", BLUE, 36)
    ann(d, 810, 370, "POST /chat", BLUE, 18)
    ann(d, 810, 400, "POST /stream", BLUE, 18)
    ann(d, 810, 430, "GET  /health", BLUE, 18)
    ann(d, 810, 460, "GET  /status", BLUE, 18)

    # XiaoHei presenting the clean box
    xha(d, 700, 550, 40, "right")

    # Clients connecting to the API
    for i, name in enumerate(["Web", "App", "Bot"]):
        cx = 1150 + i * 80
        cy = 320 + i * 60
        wcirc(d, cx, cy, 20, BLACK, 1)
        ann(d, cx - 12, cy - 8, name, BLACK, 12)
        arr(d, cx - 20, cy, 1050, 400, ORANGE, 1)

    # Labels
    ann(d, 850, 600, "标准化", BLUE, 20)
    ann(d, 850, 630, "一行代码接入", BLUE, 16)

    ann(d, 350, 780, "复杂留给自己, 简单留给调用方", ORANGE, 22)
    return img

# Save all
def save_all():
    out = r"C:\Users\20300\Desktop\AI-Agent-Study\assets"
    os.makedirs(out, exist_ok=True)
    fns = [
        (g_ch10, "10-mcp-01-unified-interface.png"),
        (g_ch11, "11-security-01-prompt-injection.png"),
        (g_ch12, "12-background-01-sync-vs-async.png"),
        (g_ch13, "13-eval-01-dashboard.png"),
        (g_ch14, "14-observability-01-tracing.png"),
        (g_ch15, "15-cost-01-model-tiering.png"),
        (g_ch16, "16-deploy-01-service-hua.png"),
    ]
    for gen, fn in fns:
        try:
            img = gen()
            img.save(os.path.join(out, fn), "PNG")
            print("OK:", fn)
        except Exception as e:
            import traceback
            print("FAIL:", fn, "-", e)
            traceback.print_exc()

if __name__ == "__main__":
    save_all()
