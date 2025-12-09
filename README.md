# VA Backend Documentation 

Backend repository for the **Vaihtoaktivaattori** project (Media Service Project course). <br>

**[Frontend Repository](https://github.com/karripar/va-frontend)** 

---

## Tech Stack & Overview

This project is built using a **microservices**-inspired architecture, divided into three core servers and two auxiliary services.

* **Core Technologies:** **Node.js**, **Express**, and **MongoDB** (Mongoose ORM).
* **Authentication:** Google Sign-In (OAuth 2.0) and custom local authentication.
* **Testing:** Vitest + Supertest.

### Service Structure

<!-- draw.io diagram -->
<div class="mxgraph" style="max-width:100%;border:1px solid transparent;" data-mxgraph="{&quot;highlight&quot;:&quot;#0000ff&quot;,&quot;nav&quot;:true,&quot;resize&quot;:true,&quot;dark-mode&quot;:&quot;auto&quot;,&quot;toolbar&quot;:&quot;zoom layers tags lightbox&quot;,&quot;edit&quot;:&quot;_blank&quot;,&quot;xml&quot;:&quot;&lt;mxfile host=\&quot;app.diagrams.net\&quot; agent=\&quot;Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\&quot; version=\&quot;29.2.4\&quot;&gt;\n  &lt;diagram name=\&quot;Page-1\&quot; id=\&quot;xHqvmx-ZynebD7y1kz74\&quot;&gt;\n    &lt;mxGraphModel dx=\&quot;2110\&quot; dy=\&quot;1164\&quot; grid=\&quot;1\&quot; gridSize=\&quot;10\&quot; guides=\&quot;1\&quot; tooltips=\&quot;1\&quot; connect=\&quot;1\&quot; arrows=\&quot;1\&quot; fold=\&quot;1\&quot; page=\&quot;1\&quot; pageScale=\&quot;1\&quot; pageWidth=\&quot;850\&quot; pageHeight=\&quot;1100\&quot; math=\&quot;0\&quot; shadow=\&quot;0\&quot;&gt;\n      &lt;root&gt;\n        &lt;mxCell id=\&quot;0\&quot; /&gt;\n        &lt;mxCell id=\&quot;1\&quot; parent=\&quot;0\&quot; /&gt;\n        &lt;mxCell id=\&quot;fExYjm54VVSgQ1T3pW3d-1\&quot; parent=\&quot;1\&quot; style=\&quot;shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=15;\&quot; value=\&quot;MongoDB\&quot; vertex=\&quot;1\&quot;&gt;\n          &lt;mxGeometry height=\&quot;80\&quot; width=\&quot;60\&quot; x=\&quot;-280\&quot; y=\&quot;300\&quot; as=\&quot;geometry\&quot; /&gt;\n        &lt;/mxCell&gt;\n        &lt;mxCell id=\&quot;fExYjm54VVSgQ1T3pW3d-13\&quot; edge=\&quot;1\&quot; parent=\&quot;1\&quot; source=\&quot;fExYjm54VVSgQ1T3pW3d-2\&quot; style=\&quot;edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;exitX=0;exitY=0.5;exitDx=0;exitDy=0;\&quot;&gt;\n          &lt;mxGeometry relative=\&quot;1\&quot; as=\&quot;geometry\&quot;&gt;\n            &lt;mxPoint x=\&quot;-90\&quot; y=\&quot;340\&quot; as=\&quot;targetPoint\&quot; /&gt;\n          &lt;/mxGeometry&gt;\n        &lt;/mxCell&gt;\n        &lt;mxCell id=\&quot;fExYjm54VVSgQ1T3pW3d-2\&quot; parent=\&quot;1\&quot; style=\&quot;rounded=0;whiteSpace=wrap;html=1;strokeColor=#00852E;\&quot; value=\&quot;&amp;lt;b&amp;gt;AUTH-SERVER&amp;lt;/b&amp;gt;&amp;lt;div&amp;gt;PORT: 3001&amp;lt;/div&amp;gt;\&quot; vertex=\&quot;1\&quot;&gt;\n          &lt;mxGeometry height=\&quot;60\&quot; width=\&quot;120\&quot; x=\&quot;10\&quot; y=\&quot;180\&quot; as=\&quot;geometry\&quot; /&gt;\n        &lt;/mxCell&gt;\n        &lt;mxCell id=\&quot;fExYjm54VVSgQ1T3pW3d-20\&quot; edge=\&quot;1\&quot; parent=\&quot;1\&quot; source=\&quot;fExYjm54VVSgQ1T3pW3d-3\&quot; style=\&quot;edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;exitX=0;exitY=0.5;exitDx=0;exitDy=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0;\&quot; target=\&quot;fExYjm54VVSgQ1T3pW3d-17\&quot;&gt;\n          &lt;mxGeometry relative=\&quot;1\&quot; as=\&quot;geometry\&quot; /&gt;\n        &lt;/mxCell&gt;\n        &lt;mxCell id=\&quot;fExYjm54VVSgQ1T3pW3d-3\&quot; parent=\&quot;1\&quot; style=\&quot;rounded=0;whiteSpace=wrap;html=1;strokeColor=#00852E;\&quot; value=\&quot;&amp;lt;b&amp;gt;CONTENT-SERVER&amp;lt;/b&amp;gt;&amp;lt;div&amp;gt;PORT: 3002&amp;lt;/div&amp;gt;\&quot; vertex=\&quot;1\&quot;&gt;\n          &lt;mxGeometry height=\&quot;60\&quot; width=\&quot;120\&quot; x=\&quot;10\&quot; y=\&quot;270\&quot; as=\&quot;geometry\&quot; /&gt;\n        &lt;/mxCell&gt;\n        &lt;mxCell id=\&quot;fExYjm54VVSgQ1T3pW3d-19\&quot; edge=\&quot;1\&quot; parent=\&quot;1\&quot; source=\&quot;fExYjm54VVSgQ1T3pW3d-4\&quot; style=\&quot;edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;exitX=0;exitY=0.5;exitDx=0;exitDy=0;entryX=0.5;entryY=1;entryDx=0;entryDy=0;\&quot; target=\&quot;fExYjm54VVSgQ1T3pW3d-17\&quot;&gt;\n          &lt;mxGeometry relative=\&quot;1\&quot; as=\&quot;geometry\&quot; /&gt;\n        &lt;/mxCell&gt;\n        &lt;mxCell id=\&quot;fExYjm54VVSgQ1T3pW3d-4\&quot; parent=\&quot;1\&quot; style=\&quot;rounded=0;whiteSpace=wrap;html=1;strokeColor=#00852E;\&quot; value=\&quot;&amp;lt;b&amp;gt;UPLOAD-SERVER&amp;lt;/b&amp;gt;&amp;lt;div&amp;gt;PORT: 3003&amp;lt;/div&amp;gt;\&quot; vertex=\&quot;1\&quot;&gt;\n          &lt;mxGeometry height=\&quot;60\&quot; width=\&quot;120\&quot; x=\&quot;10\&quot; y=\&quot;360\&quot; as=\&quot;geometry\&quot; /&gt;\n        &lt;/mxCell&gt;\n        &lt;mxCell id=\&quot;fExYjm54VVSgQ1T3pW3d-5\&quot; parent=\&quot;1\&quot; style=\&quot;rounded=0;whiteSpace=wrap;html=1;strokeColor=#00852E;\&quot; value=\&quot;&amp;lt;b&amp;gt;SYNC-SERVICE&amp;lt;/b&amp;gt;\&quot; vertex=\&quot;1\&quot;&gt;\n          &lt;mxGeometry height=\&quot;60\&quot; width=\&quot;120\&quot; x=\&quot;10\&quot; y=\&quot;530\&quot; as=\&quot;geometry\&quot; /&gt;\n        &lt;/mxCell&gt;\n        &lt;mxCell id=\&quot;fExYjm54VVSgQ1T3pW3d-17\&quot; parent=\&quot;1\&quot; style=\&quot;rhombus;whiteSpace=wrap;html=1;gradientColor=default;gradientDirection=radial;\&quot; value=\&quot;\&quot; vertex=\&quot;1\&quot;&gt;\n          &lt;mxGeometry height=\&quot;80\&quot; width=\&quot;80\&quot; x=\&quot;-130\&quot; y=\&quot;300\&quot; as=\&quot;geometry\&quot; /&gt;\n        &lt;/mxCell&gt;\n        &lt;mxCell id=\&quot;fExYjm54VVSgQ1T3pW3d-21\&quot; edge=\&quot;1\&quot; parent=\&quot;1\&quot; source=\&quot;fExYjm54VVSgQ1T3pW3d-17\&quot; style=\&quot;edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;exitX=0;exitY=0.5;exitDx=0;exitDy=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0;entryPerimeter=0;\&quot; target=\&quot;fExYjm54VVSgQ1T3pW3d-1\&quot;&gt;\n          &lt;mxGeometry relative=\&quot;1\&quot; as=\&quot;geometry\&quot; /&gt;\n        &lt;/mxCell&gt;\n        &lt;mxCell id=\&quot;fExYjm54VVSgQ1T3pW3d-23\&quot; parent=\&quot;1\&quot; style=\&quot;text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;\&quot; value=\&quot;User auhentication, session management and role-based access control&amp;amp;nbsp;\&quot; vertex=\&quot;1\&quot;&gt;\n          &lt;mxGeometry height=\&quot;70\&quot; width=\&quot;230\&quot; x=\&quot;140\&quot; y=\&quot;180\&quot; as=\&quot;geometry\&quot; /&gt;\n        &lt;/mxCell&gt;\n        &lt;mxCell id=\&quot;fExYjm54VVSgQ1T3pW3d-25\&quot; parent=\&quot;1\&quot; style=\&quot;text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;\&quot; value=\&quot;Password protected document based MongoDB local installation in port 27017\&quot; vertex=\&quot;1\&quot;&gt;\n          &lt;mxGeometry height=\&quot;30\&quot; width=\&quot;170\&quot; x=\&quot;-330\&quot; y=\&quot;250\&quot; as=\&quot;geometry\&quot; /&gt;\n        &lt;/mxCell&gt;\n        &lt;mxCell id=\&quot;fExYjm54VVSgQ1T3pW3d-26\&quot; parent=\&quot;1\&quot; style=\&quot;text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;\&quot; value=\&quot;Core application logic, data scraping and content storage handling\&quot; vertex=\&quot;1\&quot;&gt;\n          &lt;mxGeometry height=\&quot;30\&quot; width=\&quot;200\&quot; x=\&quot;155\&quot; y=\&quot;285\&quot; as=\&quot;geometry\&quot; /&gt;\n        &lt;/mxCell&gt;\n        &lt;mxCell id=\&quot;fExYjm54VVSgQ1T3pW3d-27\&quot; parent=\&quot;1\&quot; style=\&quot;text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;\&quot; value=\&quot;File and image handling, storage and serving static files to frontend\&quot; vertex=\&quot;1\&quot;&gt;\n          &lt;mxGeometry height=\&quot;30\&quot; width=\&quot;190\&quot; x=\&quot;160\&quot; y=\&quot;370\&quot; as=\&quot;geometry\&quot; /&gt;\n        &lt;/mxCell&gt;\n        &lt;mxCell id=\&quot;fExYjm54VVSgQ1T3pW3d-28\&quot; parent=\&quot;1\&quot; style=\&quot;text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;\&quot; value=\&quot;Responsible for synchronizing data automatically, refreshing the OpenAI vector store with Google Drive files.\&quot; vertex=\&quot;1\&quot;&gt;\n          &lt;mxGeometry height=\&quot;30\&quot; width=\&quot;220\&quot; x=\&quot;145\&quot; y=\&quot;545\&quot; as=\&quot;geometry\&quot; /&gt;\n        &lt;/mxCell&gt;\n        &lt;mxCell id=\&quot;fExYjm54VVSgQ1T3pW3d-29\&quot; parent=\&quot;1\&quot; style=\&quot;text;html=1;whiteSpace=wrap;overflow=hidden;rounded=0;\&quot; value=\&quot;&amp;lt;h1 style=&amp;quot;margin-top: 0px;&amp;quot;&amp;gt;Vaihtoaktivaattori Back-end Structure&amp;lt;/h1&amp;gt;&amp;lt;p&amp;gt;Backend is separated into smaller microservices in their respective ports through Apache reverse proxy configuration. Each server is run with PM2 Process Manager. Frontend is in the same server in it&amp;#39;s own port rendered statically.&amp;lt;/p&amp;gt;\&quot; vertex=\&quot;1\&quot;&gt;\n          &lt;mxGeometry height=\&quot;120\&quot; width=\&quot;380\&quot; x=\&quot;-310\&quot; y=\&quot;30\&quot; as=\&quot;geometry\&quot; /&gt;\n        &lt;/mxCell&gt;\n        &lt;mxCell id=\&quot;fExYjm54VVSgQ1T3pW3d-30\&quot; parent=\&quot;1\&quot; style=\&quot;rounded=0;whiteSpace=wrap;html=1;\&quot; value=\&quot;Frontend Application&amp;lt;div&amp;gt;PORT: 3000&amp;lt;/div&amp;gt;\&quot; vertex=\&quot;1\&quot;&gt;\n          &lt;mxGeometry height=\&quot;60\&quot; width=\&quot;120\&quot; x=\&quot;520\&quot; y=\&quot;340\&quot; as=\&quot;geometry\&quot; /&gt;\n        &lt;/mxCell&gt;\n        &lt;mxCell id=\&quot;fExYjm54VVSgQ1T3pW3d-33\&quot; edge=\&quot;1\&quot; parent=\&quot;1\&quot; style=\&quot;endArrow=classic;startArrow=classic;html=1;rounded=0;exitX=0.5;exitY=0;exitDx=0;exitDy=0;\&quot; value=\&quot;\&quot;&gt;\n          &lt;mxGeometry height=\&quot;50\&quot; relative=\&quot;1\&quot; width=\&quot;50\&quot; as=\&quot;geometry\&quot;&gt;\n            &lt;mxPoint x=\&quot;71.43\&quot; y=\&quot;360\&quot; as=\&quot;sourcePoint\&quot; /&gt;\n            &lt;mxPoint x=\&quot;70\&quot; y=\&quot;330\&quot; as=\&quot;targetPoint\&quot; /&gt;\n          &lt;/mxGeometry&gt;\n        &lt;/mxCell&gt;\n        &lt;mxCell id=\&quot;fExYjm54VVSgQ1T3pW3d-34\&quot; edge=\&quot;1\&quot; parent=\&quot;1\&quot; style=\&quot;endArrow=classic;startArrow=classic;html=1;rounded=0;exitX=0.5;exitY=0;exitDx=0;exitDy=0;\&quot; value=\&quot;\&quot;&gt;\n          &lt;mxGeometry height=\&quot;50\&quot; relative=\&quot;1\&quot; width=\&quot;50\&quot; as=\&quot;geometry\&quot;&gt;\n            &lt;mxPoint x=\&quot;71.43\&quot; y=\&quot;270\&quot; as=\&quot;sourcePoint\&quot; /&gt;\n            &lt;mxPoint x=\&quot;70\&quot; y=\&quot;240\&quot; as=\&quot;targetPoint\&quot; /&gt;\n          &lt;/mxGeometry&gt;\n        &lt;/mxCell&gt;\n        &lt;mxCell id=\&quot;fExYjm54VVSgQ1T3pW3d-35\&quot; edge=\&quot;1\&quot; parent=\&quot;1\&quot; style=\&quot;shape=flexArrow;endArrow=classic;startArrow=classic;html=1;rounded=0;fillColor=#FF55D9;\&quot; value=\&quot;\&quot;&gt;\n          &lt;mxGeometry height=\&quot;100\&quot; relative=\&quot;1\&quot; width=\&quot;100\&quot; as=\&quot;geometry\&quot;&gt;\n            &lt;mxPoint x=\&quot;357.5\&quot; y=\&quot;370\&quot; as=\&quot;sourcePoint\&quot; /&gt;\n            &lt;mxPoint x=\&quot;507.5\&quot; y=\&quot;370\&quot; as=\&quot;targetPoint\&quot; /&gt;\n          &lt;/mxGeometry&gt;\n        &lt;/mxCell&gt;\n        &lt;mxCell id=\&quot;fExYjm54VVSgQ1T3pW3d-36\&quot; parent=\&quot;1\&quot; style=\&quot;text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;\&quot; value=\&quot;Fetches the microservice backends for updated content. Sends initial Google authentication information to AUTH-SERVER\&quot; vertex=\&quot;1\&quot;&gt;\n          &lt;mxGeometry height=\&quot;30\&quot; width=\&quot;190\&quot; x=\&quot;650\&quot; y=\&quot;355\&quot; as=\&quot;geometry\&quot; /&gt;\n        &lt;/mxCell&gt;\n        &lt;mxCell id=\&quot;fExYjm54VVSgQ1T3pW3d-37\&quot; parent=\&quot;1\&quot; style=\&quot;rounded=0;whiteSpace=wrap;html=1;strokeColor=#00852E;\&quot; value=\&quot;CHAT-SERVICE&amp;lt;div&amp;gt;PORT: 3004&amp;lt;/div&amp;gt;\&quot; vertex=\&quot;1\&quot;&gt;\n          &lt;mxGeometry height=\&quot;60\&quot; width=\&quot;120\&quot; x=\&quot;10\&quot; y=\&quot;445\&quot; as=\&quot;geometry\&quot; /&gt;\n        &lt;/mxCell&gt;\n        &lt;mxCell id=\&quot;fExYjm54VVSgQ1T3pW3d-40\&quot; edge=\&quot;1\&quot; parent=\&quot;1\&quot; style=\&quot;endArrow=classic;startArrow=classic;html=1;rounded=0;exitX=0.5;exitY=0;exitDx=0;exitDy=0;\&quot; value=\&quot;\&quot;&gt;\n          &lt;mxGeometry height=\&quot;50\&quot; relative=\&quot;1\&quot; width=\&quot;50\&quot; as=\&quot;geometry\&quot;&gt;\n            &lt;mxPoint x=\&quot;71.43\&quot; y=\&quot;445\&quot; as=\&quot;sourcePoint\&quot; /&gt;\n            &lt;mxPoint x=\&quot;70\&quot; y=\&quot;415\&quot; as=\&quot;targetPoint\&quot; /&gt;\n          &lt;/mxGeometry&gt;\n        &lt;/mxCell&gt;\n        &lt;mxCell id=\&quot;fExYjm54VVSgQ1T3pW3d-41\&quot; edge=\&quot;1\&quot; parent=\&quot;1\&quot; style=\&quot;endArrow=classic;startArrow=classic;html=1;rounded=0;exitX=0.5;exitY=0;exitDx=0;exitDy=0;\&quot; value=\&quot;\&quot;&gt;\n          &lt;mxGeometry height=\&quot;50\&quot; relative=\&quot;1\&quot; width=\&quot;50\&quot; as=\&quot;geometry\&quot;&gt;\n            &lt;mxPoint x=\&quot;71.43\&quot; y=\&quot;530\&quot; as=\&quot;sourcePoint\&quot; /&gt;\n            &lt;mxPoint x=\&quot;70\&quot; y=\&quot;500\&quot; as=\&quot;targetPoint\&quot; /&gt;\n          &lt;/mxGeometry&gt;\n        &lt;/mxCell&gt;\n        &lt;mxCell id=\&quot;fExYjm54VVSgQ1T3pW3d-42\&quot; parent=\&quot;1\&quot; style=\&quot;text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;\&quot; value=\&quot;Handles chat completions and tool calls. OpenAI vector store file search and context retrieval.\&quot; vertex=\&quot;1\&quot;&gt;\n          &lt;mxGeometry height=\&quot;30\&quot; width=\&quot;205\&quot; x=\&quot;152.5\&quot; y=\&quot;460\&quot; as=\&quot;geometry\&quot; /&gt;\n        &lt;/mxCell&gt;\n        &lt;mxCell id=\&quot;fExYjm54VVSgQ1T3pW3d-45\&quot; parent=\&quot;1\&quot; style=\&quot;text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;\&quot; value=\&quot;&amp;lt;ul style=&amp;quot;box-sizing: border-box; padding-left: 2em; margin-top: 0px; margin-bottom: 0px; font-family: -apple-system, BlinkMacSystemFont, &amp;amp;quot;Segoe UI&amp;amp;quot;, &amp;amp;quot;Noto Sans&amp;amp;quot;, Helvetica, Arial, sans-serif, &amp;amp;quot;Apple Color Emoji&amp;amp;quot;, &amp;amp;quot;Segoe UI Emoji&amp;amp;quot;; font-size: 16px; text-align: start; text-wrap-mode: wrap;&amp;quot; dir=&amp;quot;auto&amp;quot;&amp;gt;&amp;lt;li style=&amp;quot;box-sizing: border-box; margin-top: 0.25em;&amp;quot;&amp;gt;&amp;lt;font style=&amp;quot;color: rgb(0, 0, 0);&amp;quot;&amp;gt;&amp;lt;em style=&amp;quot;box-sizing: border-box;&amp;quot;&amp;gt;&amp;lt;span style=&amp;quot;box-sizing: border-box; font-weight: 600;&amp;quot;&amp;gt;IMPORTANT:&amp;lt;/span&amp;gt;&amp;lt;/em&amp;gt;&amp;amp;nbsp;Each server has its own unique set of required environment variables stored in the server repository root.&amp;lt;/font&amp;gt;&amp;lt;/li&amp;gt;&amp;lt;/ul&amp;gt;\&quot; vertex=\&quot;1\&quot;&gt;\n          &lt;mxGeometry height=\&quot;40\&quot; width=\&quot;890\&quot; x=\&quot;-690\&quot; y=\&quot;650\&quot; as=\&quot;geometry\&quot; /&gt;\n        &lt;/mxCell&gt;\n        &lt;mxCell id=\&quot;8y7wlU5xgflFOYDL4XVv-1\&quot; parent=\&quot;1\&quot; style=\&quot;text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;\&quot; value=\&quot;&amp;lt;ul&amp;gt;&amp;lt;li&amp;gt;&amp;lt;font style=&amp;quot;font-size: 14px;&amp;quot;&amp;gt;GOOGLE_CLIENT_ID stored in the backend must match the one in the frontend to allow user authorization&amp;lt;/font&amp;gt;&amp;lt;/li&amp;gt;&amp;lt;/ul&amp;gt;\&quot; vertex=\&quot;1\&quot;&gt;\n          &lt;mxGeometry height=\&quot;30\&quot; width=\&quot;60\&quot; x=\&quot;-275\&quot; y=\&quot;820\&quot; as=\&quot;geometry\&quot; /&gt;\n        &lt;/mxCell&gt;\n        &lt;UserObject label=\&quot;For more thorough information, please follow this link to the backend documentation in markdown format\&quot; linkTarget=\&quot;_blank\&quot; link=\&quot;data:page/id,xHqvmx-ZynebD7y1kz74\&quot; id=\&quot;8y7wlU5xgflFOYDL4XVv-2\&quot;&gt;\n          &lt;mxCell parent=\&quot;1\&quot; style=\&quot;fontColor=#0000EE;fontStyle=4;rounded=1;overflow=hidden;spacing=10;fontSize=15;html=1;\&quot; vertex=\&quot;1\&quot;&gt;\n            &lt;mxGeometry height=\&quot;120\&quot; width=\&quot;717\&quot; x=\&quot;80\&quot; y=\&quot;30\&quot; as=\&quot;geometry\&quot; /&gt;\n          &lt;/mxCell&gt;\n        &lt;/UserObject&gt;\n      &lt;/root&gt;\n    &lt;/mxGraphModel&gt;\n  &lt;/diagram&gt;\n&lt;/mxfile&gt;\n&quot;}"></div>
<script type="text/javascript" src="https://viewer.diagrams.net/js/viewer-static.min.js"></script>


### Core Servers (Microservices)

| Server | Primary Function | Port (Example) |
| :--- | :--- | :--- |
| `auth-server` | User authentication, session management, and role-based access control. | 3001 |
| `content-server` | Core application logic, destination data scraping, and content storage. | 3002 |
| `upload-server` | File and image handling, storage, and serving static files. | 3003 |

### Auxiliary Services

| Service | Function | Note |
| :--- | :--- | :--- |
| `proxy-server` | Handles requests for AI/OpenAI features (e.g., vector store access). | **Paid/Credit Card Required** |
| `sync-service` | Responsible for synchronizing data, such as refreshing the OpenAI vector store. | **Paid/Credit Card Required** |

---

## Server Features & API Routes

All primary API routes are prefixed by **`/api/v1/`**.

### Auth Server

* **Purpose:** User management and access control.
* **Key Features:** User authentication (Google Sign-In & custom login), **Role-based access** (Exchange coordinators as admins), Profile-specific content.

| Route Group | Description |
| :--- | :--- |
| `/auth` | Login, logout, and token handling. |
| `/users` | User creation and general user management. |
| `/profile` | Fetching and updating the current user's profile and related info. |
| `/admin` | Admin-specific user and role actions. |
| `/tips` | Exchange student stories management and browsing. |

### Content Server

* **Purpose:** Core data handling and business logic.
* **Key Features:**
    * **Metropolia Exchange destination webscraping** (with coordinate data attached from a static JSON file).
    * Partner university data scraping logic and a **caching mechanism** (scraped weekly).
    * Application instructions and contact information management.
    * Exchange stories and user experiences.
    * Admin actions related to the above features.

| Route Group | Description |
| :--- | :--- |
| `/destinations` | Accessing and managing exchange destination data and scraping url storage |
| `/instructions` | Application instructions |
| `/contact` | Contact information storage and modification. |

### Upload Server

* **Purpose:** Handling file persistence.
* **Key Features:** Image and file upload logic using **Multer**. File modification and deletion.
* **Static Serving:** Files are served statically from the `uploads` folder.
    * **Base URL:** `http://localhost:3003/uploads/[filename]`

| Route Group | Description |
| :--- | :--- |
| `/upload` | Single file upload endpoints |
| `/uploads` | File listing and management endpoints. |

---

## Project Documentation

In addition to this `.md` documentation, the project includes two types of automatically generated documentation:

| Documentation Type | Content Focus | Generation Command | Access Path (Local) |
| :--- | :--- | :--- | :--- |
| **ApiDoc** | Documents the available **API routes** (endpoints). | `npm run apidoc` | `/docs/api` |
| **TypeDoc** | Documents **controllers** and core code (e.g., CRUD operations). | `npm run typedoc` | `/docs/typedoc` |

* To generate all documentation and build the server, run: `npm run build`
* **TODO:** Add live links to the documentation here when the application is launched.

---

## Project Installation Guide

**Note:** This guide must be followed for **each server subfolder** (`auth-server`, `content-server`, `upload-server`, etc.). Do not run commands from the repository root.

### 1. Prerequisites

1.  **Repository:** Clone the repository to your desired directory.
2.  **Node.js & NPM:** Ensure a stable release version is installed.

### 2. MongoDB Setup

Choose **one** of the following options:

1.  **Local Community Server (Recommended):**
    * Install the MongoDB Community Server [here](https://www.mongodb.com/try/download/community). This includes the graphical tool **MongoDB Compass**.
    * Paste the local connection string (e.g., `mongodb://localhost:27017/dbname`) into the environment variables.
2.  **MongoDB Atlas (Cloud-Hosted):**
    * Use the free basic tier on MongoDB Atlas [here](https://www.mongodb.com/products/platform/atlas-database).
    * Create a cluster, generate a connection string, and paste it into the environment variables.

### 3. Server Setup

1.  Open **separate terminals** for each server subfolder you wish to run.
2.  In each terminal, install the required dependencies: `npm install`
3.  Fill in the required **Environment Variables** (see the next section).
4.  Once MongoDB is running or connected, start the server in development mode: `npm run dev`

* All available commands are found in the respective `package.json` file.

---

## Environment Variables

### Core Configuration

* **`.env` File:** Required variables are found in the **`.env.sample`** file in *each server's subfolder*.
    * Copy the content of the sample file and create a new **`.env`** file.
    * ***IMPORTANT:*** Each server has its own unique set of required variables.

### Google API Client

* To enable the Google OAuth 2.0 flow and authentication, you need to create a Client ID.
* Follow the instructions found [here](https://developers.google.com/identity/oauth2/web/guides/get-google-api-clientid).
* Place the acquired **Client ID** in the appropriate environment variables. This ID is also required for the front-end application.

---

## Security Measures

* **Validation:** Thorough validation on all inputs using **`express-validator`**.
* **Rate Limiting:** Implemented with **`express-rate-limit`** to mitigate abuse and denial-of-service vectors.
* **Data Caching:** Scraping data is aggressively cached, limited to running **once per week** maximum, to reduce external load and increase response speed.