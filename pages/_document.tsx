import * as React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";
import createEmotionServer from "@emotion/server/create-instance";
import createEmotionCache from "../cache/createEmotionCache";
import { GA_TRACKING_ID } from "../utils/analytics";
export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
          />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/icon?family=Material+Icons"
          />
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_TRACKING_ID}', {
                  page_path: window.location.pathname,
                  });
              `,
            }}
          />
          <script
            type="javascript+paint"
            dangerouslySetInnerHTML={{
              __html: `
                  registerPaint(
                    "rounded-shape",
                    class {
                      static get inputProperties() {
                        return ["--path", "--radius", "--border", "--t", "--dash"];
                      }
                  
                      paint(ctx, size, properties) {
                        const points = properties.get("--path").toString().split(",");
                        var Ppoints = [];
                        var Cpoints = [];
                        var Radius = [];
                        const r = parseFloat(properties.get("--radius").value);
                        const b = parseFloat(properties.get("--border").value);
                        const d = properties.get("--dash").toString().split(",");
                        const t = parseInt(properties.get("--t"));
                        const w = size.width;
                        const h = size.height;
                  
                        const cc = function (x, y) {
                          var fx = 0,
                            fy = 0;
                          if (x.indexOf("calc") > -1) {
                            var tmp = x.replace("calc(", "").replace(")", "");
                            if (tmp.indexOf("+") > -1) {
                              tmp = tmp.split("+");
                              fx = (parseFloat(tmp[0]) / 100) * w + parseFloat(tmp[1]);
                            } else {
                              tmp = tmp.split("-");
                              fx = (parseFloat(tmp[0]) / 100) * w - parseFloat(tmp[1]);
                            }
                          } else if (x.indexOf("%") > -1) {
                            fx = (parseFloat(x) / 100) * w;
                          } else if (x.indexOf("px") > -1) {
                            fx = parseFloat(x);
                          }
                  
                          if (y.indexOf("calc") > -1) {
                            var tmp = y.replace("calc(", "").replace(")", "");
                            if (tmp.indexOf("+") > -1) {
                              tmp = tmp.split("+");
                              fy = (parseFloat(tmp[0]) / 100) * h + parseFloat(tmp[1]);
                            } else {
                              tmp = tmp.split("-");
                              fy = (parseFloat(tmp[0]) / 100) * h - parseFloat(tmp[1]);
                            }
                          } else if (y.indexOf("%") > -1) {
                            fy = (parseFloat(y) / 100) * h;
                          } else if (y.indexOf("px") > -1) {
                            fy = parseFloat(y);
                          }
                          return [fx, fy];
                        };
                  
                        var N = points.length;
                        for (var i = 0; i < N; i++) {
                          var j = i - 1;
                          if (j < 0) j = N - 1;
                          var p = points[i].trim().split(/(?!\\(.*)\\s(?![^(]*?\\))/g);
                          if (p[2]) Radius.push(parseInt(p[2]));
                          else Radius.push(r);
                          
                          p = cc(p[0], p[1]);
                          Ppoints.push([p[0], p[1]]);
                          var pj = points[j].trim().split(/(?!\\(.*)\\s(?![^(]*?\\))/g);
                          pj = cc(pj[0], pj[1]);
                          Cpoints.push([p[0] - (p[0] - pj[0]) / 2, p[1] - (p[1] - pj[1]) / 2]);
                        }
                        ctx.beginPath();
                        ctx.moveTo(Cpoints[0][0], Cpoints[0][1]);
                        var i;
                        var rr;
                        for (i = 0; i < Cpoints.length - 1; i++) {
                          var angle =
                            Math.atan2(
                              Cpoints[i + 1][1] - Ppoints[i][1],
                              Cpoints[i + 1][0] - Ppoints[i][0]
                            ) -
                            Math.atan2(
                              Cpoints[i][1] - Ppoints[i][1],
                              Cpoints[i][0] - Ppoints[i][0]
                            );
                          if (angle < 0) {
                            angle += 2 * Math.PI;
                          }
                          if (angle > Math.PI) {
                            angle = 2 * Math.PI - angle;
                          }
                          var distance = Math.min(
                            Math.sqrt(
                              (Cpoints[i + 1][1] - Ppoints[i][1]) ** 2 +
                                (Cpoints[i + 1][0] - Ppoints[i][0]) ** 2
                            ),
                            Math.sqrt(
                              (Cpoints[i][1] - Ppoints[i][1]) ** 2 +
                                (Cpoints[i][0] - Ppoints[i][0]) ** 2
                            )
                          );
                          rr = Math.min(distance * Math.tan(angle / 2), Radius[i]);
                          ctx.arcTo(
                            Ppoints[i][0],
                            Ppoints[i][1],
                            Cpoints[i + 1][0],
                            Cpoints[i + 1][1],
                            rr
                          );
                        }
                        var angle =
                          Math.atan2(
                            Cpoints[0][1] - Ppoints[i][1],
                            Cpoints[0][0] - Ppoints[i][0]
                          ) -
                          Math.atan2(
                            Cpoints[i][1] - Ppoints[i][1],
                            Cpoints[i][0] - Ppoints[i][0]
                          );
                        if (angle < 0) {
                          angle += 2 * Math.PI;
                        }
                        if (angle > Math.PI) {
                          angle = 2 * Math.PI - angle;
                        }
                        var distance = Math.min(
                          Math.sqrt(
                            (Cpoints[0][1] - Ppoints[i][1]) ** 2 +
                              (Cpoints[0][0] - Ppoints[i][0]) ** 2
                          ),
                          Math.sqrt(
                            (Cpoints[i][1] - Ppoints[i][1]) ** 2 +
                              (Cpoints[i][0] - Ppoints[i][0]) ** 2
                          )
                        );
                        rr = Math.min(distance * Math.tan(angle / 2), Radius[i]);
                        ctx.arcTo(Ppoints[i][0], Ppoints[i][1], Cpoints[0][0], Cpoints[0][1], rr);
                        ctx.closePath();
                  
                        if (t == 0) {
                          ctx.fillStyle = "#000";
                          ctx.fill();
                        } else {
                          ctx.setLineDash(d);
                          ctx.lineWidth = 2 * b;
                          ctx.strokeStyle = "#000";
                          ctx.stroke();
                        }
                      }
                    }
                  )              
              `,
            }}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                  if ("paintWorklet" in CSS) {
                    const src = document.querySelector('script[type$="paint"]').innerHTML;
                    const blob = new Blob([src], {
                      type: 'text/javascript'
                    });
                    CSS.paintWorklet.addModule(URL.createObjectURL(blob));
                  }
              `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

// `getInitialProps` belongs to `_document` (instead of `_app`),
// it's compatible with static-site generation (SSG).
MyDocument.getInitialProps = async (ctx) => {
  // Resolution order
  //
  // On the server:
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. document.getInitialProps
  // 4. app.render
  // 5. page.render
  // 6. document.render
  //
  // On the server with error:
  // 1. document.getInitialProps
  // 2. app.render
  // 3. page.render
  // 4. document.render
  //
  // On the client
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. app.render
  // 4. page.render

  const originalRenderPage = ctx.renderPage;

  // You can consider sharing the same emotion cache between all the SSR requests to speed up performance.
  // However, be aware that it can have global side effects.
  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App: any) =>
        function EnhanceApp(props) {
          return <App emotionCache={cache} {...props} />;
        },
    });

  const initialProps = await Document.getInitialProps(ctx);
  // This is important. It prevents emotion to render invalid HTML.
  // See https://github.com/mui-org/material-ui/issues/26561#issuecomment-855286153
  const emotionStyles = extractCriticalToChunks(initialProps.html);
  const emotionStyleTags = emotionStyles.styles.map((style) => (
    <style
      data-emotion={`${style.key} ${style.ids.join(" ")}`}
      key={style.key}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: style.css }}
    />
  ));

  return {
    ...initialProps,
    // Styles fragment is rendered after the app and page rendering finish.
    styles: [
      ...React.Children.toArray(initialProps.styles),
      ...emotionStyleTags,
    ],
  };
};
