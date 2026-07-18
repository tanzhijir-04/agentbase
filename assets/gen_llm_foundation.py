#!/usr/bin/env python3
"""Generate 9 xiaohei-style illustrations for LLM Foundation tutorials."""
import math, random, os
from PIL import Image, ImageDraw, ImageFont

W, H = 1536, 1024
WHITE = (255, 255, 255)
BLACK = (30, 30, 30)
RED = (210, 50, 50)
ORANGE = (230, 130, 30)
BLUE = (50, 100, 200)
LIGHT_BLUE = (140, 180, 230)

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
        x1, y1 = pts[i]; x2, y2 = pts[i+1]
        steps = max(int(math.hypot(x2-x1, y2-y1)/3), 1)
        pp = []
        for s in range(steps+1):
            t = s / steps
            pp.append((x1+(x2-x1)*t + random.uniform(-1.5,1.5),
                       y1+(y2-y1)*t + random.uniform(-1.5,1.5)))
        for j in range(len(pp)-1):
            draw.line([pp[j], pp[j+1]], fill=color, width=width)

def wrect(draw, x, y, w, h, color=BLACK, width=2):
    wline(draw, [(x,y),(x+w,y),(x+w,y+h),(x,y+h),(x,y)], color, width)

def wcirc(draw, cx, cy, r, color=BLACK, width=2):
    pts = [(cx+r*math.cos(i*10*math.pi/180)+random.uniform(-1.5,1.5),
            cy+r*math.sin(i*10*math.pi/180)+random.uniform(-1.5,1.5)) for i in range(37)]
    pts.append(pts[0])
    wline(draw, pts, color, width)

def xh(draw, cx, cy, sz=40):
    """Draw xiaohei (small black creature)."""
    bw, bh = sz*0.7, sz*0.8
    bp = [(cx+bw*math.cos(i*(360.0/25)*math.pi/180)+random.uniform(-1,1),
           cy+bh*math.sin(i*(360.0/25)*math.pi/180)+random.uniform(-1,1)) for i in range(25)]
    bp.append(bp[0])
    draw.polygon(bp, fill=BLACK)
    ey = cy - sz*0.15; eo = sz*0.2; er = sz*0.08
    draw.ellipse([cx-eo-er, ey-er, cx-eo+er, ey+er], fill=WHITE)
    draw.ellipse([cx+eo-er, ey-er, cx+eo+er, ey+er], fill=WHITE)
    lb = cy + bh + sz*0.35; ly = cy + bh*0.6
    for lo in [-sz*0.25, sz*0.25]:
        wline(draw, [(cx+lo, ly), (cx+lo+random.uniform(-2,2), lb)], BLACK, 2)

def xha(draw, cx, cy, sz=40, d="right"):
    """Draw xiaohei with arm extended."""
    xh(draw, cx, cy, sz)
    ay = cy - sz*0.1
    if d == "right": e = (cx+sz*1.2, ay+random.uniform(-5,5))
    elif d == "left": e = (cx-sz*1.2, ay+random.uniform(-5,5))
    elif d == "up": e = (cx+sz*0.3, cy-sz*1.3)
    else: e = (cx+sz*0.3, cy+sz*1.0)
    wline(draw, [(cx+sz*0.4, ay), e], BLACK, 2)

def ann(draw, x, y, text, color=RED, size=22):
    draw.text((x, y), text, fill=color, font=get_font(size))

def arr(draw, x1, y1, x2, y2, color=ORANGE, width=3):
    wline(draw, [(x1,y1),(x2,y2)], color, width)
    a = math.atan2(y2-y1, x2-x1)
    for da in [0.4, -0.4]:
        wline(draw, [(x2,y2), (x2-15*math.cos(a+da), y2-15*math.sin(a+da))], color, width)

# ──────────────────────────────────────────────
# Article 1: Token Basics
# ──────────────────────────────────────────────

def g_token_cutting():
    """图1: 小黑拿剪刀把中英文纸条切成不同大小碎片"""
    random.seed(101); img = Image.new("RGB", (W, H), WHITE); d = ImageDraw.Draw(img)

    # English strip - long, narrow pieces
    ann(d, 120, 220, "English", BLACK, 20)
    wrect(d, 120, 260, 500, 50, BLACK, 2)
    # Cut marks on English strip (small pieces)
    for cx in [220, 300, 370, 440, 510]:
        wline(d, [(cx, 260), (cx+5, 310)], RED, 2)
    ann(d, 140, 270, "Hello", BLUE, 16)
    ann(d, 230, 270, "world", BLUE, 16)
    ann(d, 310, 270, "how", BLUE, 16)
    ann(d, 380, 270, "are", BLUE, 16)
    ann(d, 450, 270, "you", BLUE, 16)
    ann(d, 180, 330, "Token ≠ 字", RED, 22)

    # Chinese strip - fewer, bigger pieces
    ann(d, 120, 420, "中文", BLACK, 20)
    wrect(d, 120, 460, 500, 80, BLACK, 2)
    # Cut marks on Chinese strip (big pieces)
    for cx in [300, 440]:
        wline(d, [(cx, 460), (cx+5, 540)], RED, 2)
    ann(d, 160, 480, "人工智能", BLUE, 22)
    ann(d, 320, 480, "发展", BLUE, 22)
    ann(d, 460, 480, "很快", BLUE, 22)
    ann(d, 180, 560, "语义片段", RED, 22)

    # Xiaohei with scissors in the middle
    xha(d, 650, 450, 50, "left")
    # Scissors
    wline(d, [(690, 420), (720, 380)], BLACK, 3)
    wline(d, [(690, 420), (720, 460)], BLACK, 3)
    wline(d, [(720, 380), (735, 370)], BLACK, 2)
    wline(d, [(720, 460), (735, 470)], BLACK, 2)
    ann(d, 700, 340, "✂", BLACK, 28)

    # Right side: scattered small and big pieces
    for i, (px, py) in enumerate([(900,300),(950,350),(1000,280),(1050,330),(920,400)]):
        wrect(d, px, py, 35, 20, BLACK, 1)
        ann(d, px+3, py+2, "tok", BLUE, 10)

    for i, (px, py) in enumerate([(900,500),(1000,520),(950,580)]):
        wrect(d, px, py, 70, 40, BLACK, 1)
        ann(d, px+5, py+8, "token", BLUE, 14)

    # Annotation
    ann(d, 850, 220, "分词器", ORANGE, 24)
    ann(d, 1050, 220, "不同模型切法不同", BLUE, 18)

    # Summary annotation
    ann(d, 400, 680, "同一个句子，不同模型 token 数不一样", RED, 20)

    return img


def g_token_budget():
    """图2: 小黑往天平上放砝码"""
    random.seed(102); img = Image.new("RGB", (W, H), WHITE); d = ImageDraw.Draw(img)

    # Balance scale base
    cx_base = 700
    # Stand
    wline(d, [(cx_base, 700), (cx_base, 400)], BLACK, 4)
    # Horizontal beam
    wline(d, [(350, 420), (1050, 420)], BLACK, 3)
    # Pivot
    wcirc(d, cx_base, 400, 15, BLACK, 3)
    # Left pan (slightly lower because heavy)
    wline(d, [(350, 420), (300, 520), (400, 520), (350, 420)], BLACK, 2)
    wline(d, [(290, 520), (410, 520)], BLACK, 3)
    # Right pan
    wline(d, [(1050, 420), (1000, 500), (1100, 500), (1050, 420)], BLACK, 2)
    wline(d, [(990, 500), (1110, 500)], BLACK, 3)

    # Weights on left pan (the heavy input tokens)
    wrect(d, 310, 480, 80, 35, ORANGE, 2)
    ann(d, 315, 485, "System", ORANGE, 14)
    ann(d, 315, 505, "Prompt", ORANGE, 14)

    wrect(d, 310, 440, 80, 35, RED, 2)
    ann(d, 315, 445, "对话历史", RED, 14)

    # Weights on right pan (output)
    wrect(d, 1010, 460, 80, 35, BLUE, 2)
    ann(d, 1015, 465, "输出预算", BLUE, 14)

    # Extra weight being placed by xiaohei
    wrect(d, 305, 525, 90, 35, ORANGE, 2)
    ann(d, 310, 530, "工具定义", ORANGE, 14)

    # Xiaohei placing the tool definition weight
    xha(d, 500, 550, 45, "left")

    # Labels
    ann(d, 350, 370, "Input Tokens", RED, 20)
    ann(d, 1020, 370, "Output", BLUE, 20)
    ann(d, cx_base-50, 340, "Token 预算", BLACK, 24)

    # Bottom annotations
    ann(d, 200, 700, "每个组成部分都要算钱", RED, 22)
    ann(d, 200, 740, "永远别按满算，留 20-30% 余量", ORANGE, 18)

    return img


def g_temperature_dial():
    """图3: 小黑转动一个带刻度的旋钮，左边冰块右边火焰"""
    random.seed(103); img = Image.new("RGB", (W, H), WHITE); d = ImageDraw.Draw(img)

    # Large dial circle
    dial_cx, dial_cy, dial_r = 600, 480, 180
    wcirc(d, dial_cx, dial_cy, dial_r, BLACK, 3)

    # Dial markings
    for i in range(11):
        angle = math.radians(210 - i * 24)  # from 210° to -30°
        x1 = dial_cx + (dial_r-15) * math.cos(angle)
        y1 = dial_cy + (dial_r-15) * math.sin(angle)
        x2 = dial_cx + (dial_r+5) * math.cos(angle)
        y2 = dial_cy + (dial_r+5) * math.sin(angle)
        wline(d, [(x1,y1),(x2,y2)], BLACK, 2)
        # Scale numbers
        tx = dial_cx + (dial_r+25) * math.cos(angle)
        ty = dial_cy + (dial_r+25) * math.sin(angle)
        ann(d, tx-8, ty-8, str(round(i*0.2, 1)), BLACK, 14)

    # Temperature label
    ann(d, dial_cx-55, dial_cy+40, "Temperature", BLACK, 20)

    # Needle pointing to middle-high position
    needle_angle = math.radians(210 - 6 * 24)
    nx = dial_cx + (dial_r-30) * math.cos(needle_angle)
    ny = dial_cy + (dial_r-30) * math.sin(needle_angle)
    wline(d, [(dial_cx, dial_cy), (nx, ny)], RED, 4)
    wcirc(d, dial_cx, dial_cy, 10, RED, 2)

    # Ice on left side
    ann(d, 200, 380, "🧊", BLACK, 40)
    ann(d, 180, 440, "低温", BLUE, 22)
    ann(d, 170, 470, "→ 确定", BLUE, 20)
    ann(d, 170, 500, "→ argmax", BLUE, 16)

    # Fire on right side
    ann(d, 950, 380, "🔥", BLACK, 40)
    ann(d, 930, 440, "高温", RED, 22)
    ann(d, 920, 470, "→ 随机", RED, 20)
    ann(d, 920, 500, "→ 发散", RED, 16)

    # Arrow from ice to fire across the top
    arr(d, 280, 350, 900, 350, ORANGE, 2)

    # Xiaohei turning the dial
    xha(d, 750, 620, 48, "left")

    # Bottom annotations
    ann(d, 300, 750, "稳定输出 → 0.1-0.3", BLACK, 18)
    ann(d, 700, 750, "创意满满 → 0.8", BLACK, 18)
    ann(d, 350, 800, "不要同时调 temperature 和 top_p", RED, 20)

    return img


# ──────────────────────────────────────────────
# Article 2: Function Calling
# ──────────────────────────────────────────────

def g_structured_output():
    """图4: 小黑从一团乱麻中抽出一张整齐的表格"""
    random.seed(201); img = Image.new("RGB", (W, H), WHITE); d = ImageDraw.Draw(img)

    # Left side: tangled mess of text (chaos)
    chaos_lines = [
        "北京明天25度", "天气晴朗适合出门", "我觉得你应该",
        "带把伞以防万一", "温度大约在", "20到28之间吧",
        "哦对了风力", "大概是3级左右", "湿度呢我猜",
        "应该有60%吧"
    ]
    for i, line in enumerate(chaos_lines):
        x = 80 + random.randint(-20, 80)
        y = 250 + i * 45 + random.randint(-10, 10)
        angle_off = random.randint(-15, 15)
        ann(d, x, y, line, BLACK, 16)

    # Tangled lines connecting the mess
    for _ in range(8):
        x1 = random.randint(80, 420)
        y1 = random.randint(250, 680)
        x2 = random.randint(80, 420)
        y2 = random.randint(250, 680)
        wline(d, [(x1,y1),(x2,y2)], (180,180,180), 1)

    ann(d, 100, 180, "自然语言 →", RED, 24)
    ann(d, 100, 720, "模型自由发挥，代码无法解析", RED, 18)

    # Arrow from chaos to structure
    arr(d, 480, 500, 620, 500, ORANGE, 4)
    ann(d, 500, 460, "结构化", ORANGE, 20)

    # Right side: neat JSON table
    wrect(d, 660, 250, 400, 300, BLACK, 2)
    # Header row
    d.rectangle([660, 250, 1060, 290], fill=(240,240,240))
    ann(d, 680, 260, "JSON 输出", BLACK, 18)
    # Rows
    json_lines = [
        ('{', BLACK),
        ('  "city": "北京",', BLUE),
        ('  "temp": 25,', BLUE),
        ('  "weather": "晴",', BLUE),
        ('  "wind": "3级",', BLUE),
        ('  "humidity": "60%"', BLUE),
        ('}', BLACK),
    ]
    for i, (line, col) in enumerate(json_lines):
        ann(d, 680, 300 + i*30, line, col, 16)

    ann(d, 680, 570, "机器可解析", ORANGE, 20)
    ann(d, 680, 600, "JSON.parse() 直接用", BLUE, 16)

    # Xiaohei pulling the table out of the mess
    xha(d, 560, 500, 50, "right")

    # Bottom annotation
    ann(d, 350, 780, "可靠 + 可组合 + 机器可解析", RED, 22)

    return img


def g_tool_calling_flow():
    """图5: 小黑把申请表递进怪机器"""
    random.seed(202); img = Image.new("RGB", (W, H), WHITE); d = ImageDraw.Draw(img)

    # Step 1: User request (left)
    wrect(d, 80, 400, 180, 80, BLACK, 2)
    ann(d, 100, 420, "用户请求", BLACK, 18)
    ann(d, 100, 450, '"查天气"', BLUE, 14)

    # Arrow to LLM
    arr(d, 260, 440, 350, 440, ORANGE, 3)
    ann(d, 280, 400, "①声明意图", ORANGE, 16)

    # Step 2: LLM decides (center-left)
    wrect(d, 350, 380, 200, 120, BLACK, 2)
    ann(d, 380, 400, "LLM 分析", BLACK, 18)
    ann(d, 370, 430, "tool_call:", RED, 14)
    ann(d, 370, 455, "get_weather", BLUE, 14)
    ann(d, 370, 475, 'city="北京"', BLUE, 14)

    # Arrow to machine
    arr(d, 550, 440, 640, 440, ORANGE, 3)
    ann(d, 560, 400, "②代码执行", ORANGE, 16)

    # The machine (center) - a weird box with gears
    wrect(d, 640, 350, 220, 180, BLACK, 3)
    ann(d, 680, 370, "代码执行器", BLACK, 18)
    # Gear symbols
    wcirc(d, 720, 450, 25, BLACK, 2)
    wcirc(d, 800, 430, 20, BLACK, 2)
    ann(d, 670, 480, "HTTP / DB / API", BLUE, 14)
    # Input slot
    wrect(d, 640, 420, 20, 40, BLACK, 2)

    # Arrow from machine to result
    arr(d, 860, 440, 950, 440, ORANGE, 3)
    ann(d, 870, 400, "③结果返回", ORANGE, 16)

    # Step 4: Result
    wrect(d, 950, 400, 180, 80, BLACK, 2)
    ann(d, 970, 420, "执行结果", BLACK, 18)
    ann(d, 970, 450, '{"temp":25}', BLUE, 14)

    # Arrow back to LLM
    arr(d, 1040, 490, 1040, 580, ORANGE, 2)
    arr(d, 1040, 580, 500, 580, ORANGE, 2)
    arr(d, 500, 580, 500, 500, ORANGE, 2)
    ann(d, 700, 600, "④回到 LLM → 生成回复", ORANGE, 16)

    # Xiaohei feeding the form into the machine
    xha(d, 600, 300, 45, "right")

    # Loop indicator
    ann(d, 150, 600, "循环直到 finish_reason = stop", RED, 18)

    # Bottom summary
    ann(d, 300, 750, "模型声明意图 → 代码实际执行 → 结果返回模型", RED, 22)

    return img


def g_parallel_calls():
    """图6: 小黑同时伸出三只手接三根不同的管道"""
    random.seed(203); img = Image.new("RGB", (W, H), WHITE); d = ImageDraw.Draw(img)

    # Three source pipes from the top
    pipe_data = [
        ("北京天气", 350, "25°C 晴"),
        ("上海天气", 650, "22°C 多云"),
        ("深圳天气", 950, "28°C 雨"),
    ]

    for i, (label, cx, result) in enumerate(pipe_data):
        # Pipe from top
        wrect(d, cx-40, 100, 80, 200, BLACK, 2)
        ann(d, cx-30, 120, label, BLACK, 16)
        ann(d, cx-30, 160, "API", BLUE, 14)

        # Pipe end
        wrect(d, cx-20, 300, 40, 20, BLACK, 2)

        # Result coming out
        ann(d, cx-40, 340, result, BLUE, 16)

    # Xiaohei in the middle with arms to all three
    xh(d, 650, 500, 60)
    # Three arms
    wline(d, [(650-60*0.4, 480), (350, 320)], BLACK, 3)
    wline(d, [(650, 440), (650, 320)], BLACK, 3)
    wline(d, [(650+60*0.4, 480), (950, 320)], BLACK, 3)

    # Promise.all annotation
    ann(d, 550, 620, "Promise.all", ORANGE, 24)
    ann(d, 550, 660, "三个独立请求同时发出", BLUE, 18)

    # Label
    ann(d, 400, 180, "并行调用", RED, 24)
    ann(d, 380, 210, "独立工具 → 一次返回多个 tool_calls", ORANGE, 18)

    # Bottom note
    ann(d, 300, 780, "注意：工具之间不能有依赖关系才能并行", RED, 18)

    return img


# ──────────────────────────────────────────────
# Article 3: LLM Client
# ──────────────────────────────────────────────

def g_raw_vs_wrapped():
    """图7: 左边小黑在暴风雨中裸奔，右边小黑在屋子里安全操控"""
    random.seed(301); img = Image.new("RGB", (W, H), WHITE); d = ImageDraw.Draw(img)

    # LEFT SIDE: Storm / raw calling
    ann(d, 150, 150, "裸调 API", RED, 26)

    # Rain lines
    for _ in range(30):
        x = random.randint(50, 550)
        y = random.randint(200, 700)
        wline(d, [(x, y), (x-10, y+30)], (180,180,200), 1)

    # Lightning bolt
    wline(d, [(350, 180), (320, 300), (360, 320), (300, 500)], RED, 3)

    # Xiaohei being struck
    xh(d, 350, 550, 45)
    ann(d, 300, 610, "💥 网络抖动", RED, 16)
    ann(d, 300, 640, "💥 rate limit", RED, 16)
    ann(d, 300, 670, "💥 超时", RED, 16)

    # Error messages floating
    ann(d, 150, 350, "Error 429", RED, 18)
    ann(d, 400, 300, "Error 500", RED, 18)
    ann(d, 200, 450, "timeout!", RED, 18)

    # Divider
    wline(d, [(600, 150), (600, 800)], BLACK, 2)
    ann(d, 580, 830, "VS", BLACK, 20)

    # RIGHT SIDE: Safe / wrapped
    ann(d, 750, 150, "封装 LLM Client", ORANGE, 26)

    # House / shield shape
    # Roof
    wline(d, [(680, 350), (850, 250), (1020, 350)], BLACK, 3)
    # Walls
    wrect(d, 700, 350, 300, 300, BLACK, 3)

    # Xiaohei safely inside operating a machine
    xh(d, 850, 500, 40)
    # Control panel
    wrect(d, 780, 450, 140, 60, BLUE, 2)
    ann(d, 790, 460, "重试机制", BLUE, 14)
    ann(d, 790, 480, "超时控制", BLUE, 14)

    # Check marks
    ann(d, 720, 400, "✅ 重试", ORANGE, 16)
    ann(d, 720, 440, "✅ 超时保护", ORANGE, 16)
    ann(d, 720, 480, "✅ 错误分类", ORANGE, 16)

    # Rain bouncing off the roof
    for _ in range(10):
        x = random.randint(700, 1000)
        y = random.randint(220, 280)
        wline(d, [(x, y-20), (x, y)], (180,180,200), 1)

    # Bottom annotation
    ann(d, 200, 770, "裸调 → 一次失败全盘崩溃", RED, 20)
    ann(d, 700, 770, "封装 → 自动重试 + 超时 + 分类", ORANGE, 20)

    return img


def g_exponential_backoff():
    """图8: 小黑在爬楼梯，每层越来越高"""
    random.seed(302); img = Image.new("RGB", (W, H), WHITE); d = ImageDraw.Draw(img)

    # Stairs getting progressively taller
    stair_x = [200, 350, 500, 650, 800, 950, 1100]
    stair_h = [100, 150, 200, 280, 380, 500, 640]  # exponential growth
    base_y = 800

    for i in range(len(stair_x)):
        x = stair_x[i]
        h = stair_h[i]
        y = base_y - h
        wrect(d, x, y, 120, h, BLACK, 2)
        # Time labels on each step
        times = ["1s", "2s", "4s", "8s", "16s", "32s", "60s"]
        ann(d, x+20, y-30, times[i], ORANGE, 20)

    # Xiaohei climbing the stairs (on step 3)
    xha(d, 560, base_y - stair_h[2] - 40, 40, "up")

    # Failed attempts markers
    for i in range(3):
        x = stair_x[i] + 60
        y = base_y - stair_h[i] - 50
        ann(d, x-10, y, "✗", RED, 24)

    # Current attempt
    ann(d, 540, base_y - stair_h[2] - 90, "retry...", ORANGE, 18)

    # Exponential formula
    ann(d, 200, 150, "delay = base × 2^attempt", RED, 24)
    ann(d, 200, 190, "指数退避", RED, 22)

    # Jitter annotation
    ann(d, 700, 180, "Jitter: ±25% 随机", BLUE, 20)
    ann(d, 700, 210, "避免惊群效应", BLUE, 16)

    # Arrow showing growth
    arr(d, 250, base_y-50, 1150, base_y-650, ORANGE, 2)

    # Bottom note
    ann(d, 300, 880, "每次重试等待翻倍 + 随机抖动 → 防止重试风暴", RED, 20)

    return img


def g_circuit_breaker():
    """图9: 小黑站在大闸门前，闸门有三种状态"""
    random.seed(303); img = Image.new("RGB", (W, H), WHITE); d = ImageDraw.Draw(img)

    # Large gate in the center
    gate_x, gate_y, gate_w, gate_h = 500, 250, 400, 450
    wrect(d, gate_x, gate_y, gate_w, gate_h, BLACK, 4)

    # Gate top decoration
    wline(d, [(gate_x-20, gate_y), (gate_x+gate_w+20, gate_y)], BLACK, 4)

    # Three states shown as positions of a gate bar
    # CLOSED (left) - bar down, blocking
    ann(d, gate_x+30, gate_y+30, "CLOSED", BLACK, 20)
    ann(d, gate_x+30, gate_y+60, "关闭", BLACK, 18)
    wrect(d, gate_x+20, gate_y+90, 100, 15, BLACK, 3)
    ann(d, gate_x+30, gate_y+110, "正常通行", ORANGE, 14)

    # OPEN (center) - bar up, blocked
    ann(d, gate_x+150, gate_y+30, "OPEN", RED, 20)
    ann(d, gate_x+150, gate_y+60, "打开", RED, 18)
    wrect(d, gate_x+140, gate_y+90, 100, 15, RED, 3)
    ann(d, gate_x+150, gate_y+110, "停止请求", RED, 14)

    # HALF_OPEN (right) - bar half
    ann(d, gate_x+270, gate_y+30, "HALF_OPEN", BLUE, 20)
    ann(d, gate_x+270, gate_y+60, "半开", BLUE, 18)
    wrect(d, gate_x+260, gate_y+90, 100, 15, BLUE, 3)
    ann(d, gate_x+270, gate_y+110, "试探放行", BLUE, 14)

    # Flow arrows between states
    arr(d, gate_x+80, gate_y+180, gate_x+200, gate_y+180, ORANGE, 2)
    ann(d, gate_x+100, gate_y+195, "连续失败", RED, 14)

    arr(d, gate_x+200, gate_y+210, gate_x+320, gate_y+210, ORANGE, 2)
    ann(d, gate_x+220, gate_y+225, "超时后", BLUE, 14)

    arr(d, gate_x+350, gate_y+250, gate_x+350, gate_y+340, ORANGE, 2)
    arr(d, gate_x+350, gate_y+340, gate_x+80, gate_y+340, ORANGE, 2)
    arr(d, gate_x+80, gate_y+340, gate_x+80, gate_y+260, ORANGE, 2)
    ann(d, gate_x+160, gate_y+355, "成功 → 恢复", ORANGE, 14)

    # Xiaohei standing guard at the gate
    xha(d, 700, 600, 55, "left")

    # Gate structure details - pillars
    wline(d, [(gate_x, gate_y), (gate_x, gate_y+gate_h)], BLACK, 4)
    wline(d, [(gate_x+gate_w, gate_y), (gate_x+gate_w, gate_y+gate_h)], BLACK, 4)

    # Bottom annotations
    ann(d, 200, 770, "熔断 = 连续失败后自动停药", RED, 22)
    ann(d, 200, 810, "防止雪崩效应，给上游恢复时间", ORANGE, 18)
    ann(d, 600, 770, "threshold = 5", BLUE, 16)
    ann(d, 600, 800, "resetTimeout = 60s", BLUE, 16)

    return img


def save_all():
    out = r"C:\Users\20300\Desktop\AI-Agent-Study\assets"
    os.makedirs(out, exist_ok=True)
    fns = [
        (g_token_cutting,     "01-token-basics-01-token-cutting.png"),
        (g_token_budget,      "01-token-basics-02-token-budget.png"),
        (g_temperature_dial,  "01-token-basics-03-temperature-dial.png"),
        (g_structured_output, "02-function-calling-01-structured-output.png"),
        (g_tool_calling_flow, "02-function-calling-02-tool-calling-flow.png"),
        (g_parallel_calls,    "02-function-calling-03-parallel-calls.png"),
        (g_raw_vs_wrapped,    "03-llm-client-01-raw-vs-wrapped.png"),
        (g_exponential_backoff, "03-llm-client-02-exponential-backoff.png"),
        (g_circuit_breaker,   "03-llm-client-03-circuit-breaker.png"),
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
