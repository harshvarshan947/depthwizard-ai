import React, { useState } from 'react';
import { 
  Download, FileText, Box, Layers, Mountain, 
  Code, CheckCircle2, ShieldAlert, Sparkles, FileDown 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const ExportPage: React.FC = () => {
  const { currentResult } = useApp();
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  const imageId = currentResult?.image_id || 'demo_urban_commercial';

  const handleDownload = (format: string, url: string, filename: string) => {
    setDownloadingFormat(format);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloadingFormat(null), 800);
  };

  const exportCards = [
    {
      id: 'depth',
      title: 'Depth Map PNG',
      desc: '16-bit / 8-bit normalized grayscale spatial depth raster.',
      icon: Layers,
      color: 'from-blue-500 to-cyan-500',
      action: () => handleDownload('depth', api.getExportUrl(imageId, 'depth'), `${imageId}_depth.png`),
      badge: 'Raster GeoTIFF/PNG'
    },
    {
      id: 'height',
      title: 'Height Field PNG',
      desc: 'Hypsometric color-graded elevation heatmap with calibration ramp.',
      icon: Mountain,
      color: 'from-emerald-500 to-teal-500',
      action: () => handleDownload('height', api.getExportUrl(imageId, 'height'), `${imageId}_height_map.png`),
      badge: 'Elevation Heatmap'
    },
    {
      id: 'obj',
      title: 'Wavefront 3D OBJ',
      desc: 'Triangulated 3D mesh polygon surface with UV coordinates.',
      icon: Box,
      color: 'from-cyan-500 to-indigo-500',
      action: () => handleDownload('obj', api.getExportUrl(imageId, 'obj'), `${imageId}_terrain.obj`),
      badge: 'Standard 3D CAD/GIS'
    },
    {
      id: 'ply',
      title: 'Stanford PLY Point Cloud',
      desc: 'RGB colorized 3D LiDAR-style discrete spatial point cloud.',
      icon: Box,
      color: 'from-purple-500 to-pink-500',
      action: () => handleDownload('ply', api.getExportUrl(imageId, 'ply'), `${imageId}_pointcloud.ply`),
      badge: 'Dense Point Cloud'
    },
    {
      id: 'json',
      title: 'Geospatial Metadata JSON',
      desc: 'Structured JSON containing coordinates, heights, confidence & objects.',
      icon: Code,
      color: 'from-amber-500 to-orange-500',
      action: () => handleDownload('json', api.getExportUrl(imageId, 'json'), `${imageId}_analysis.json`),
      badge: 'GeoJSON Metadata'
    },
    {
      id: 'report',
      title: 'SIH Analysis Report',
      desc: 'Comprehensive markdown & plain-text geospatial evaluation summary with disclaimers.',
      icon: FileText,
      color: 'from-rose-500 to-red-500',
      action: () => handleDownload('report', api.getReportUrl(imageId), `${imageId}_report.md`),
      badge: 'Audit & Hackathon Doc'
    },
  ];

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      
      {/* Title */}
      <div className="pb-4 border-b border-cyan-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-mono font-bold text-white flex items-center space-x-2">
            <Download className="w-5 h-5 text-cyan-400" />
            <span>Geospatial Export Center & Report Generation</span>
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Download production-ready 3D meshes, GIS point clouds, raster maps, and structured analytical reports.
          </p>
        </div>

        {/* Big Action: Generate Full Report */}
        <button
          onClick={() => handleDownload('report', api.getReportUrl(imageId), `${imageId}_report.md`)}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-navy-950 font-bold font-mono text-xs shadow-glow-cyan transition"
        >
          <FileDown className="w-4 h-4 fill-navy-950" />
          <span>GENERATE ANALYSIS REPORT</span>
        </button>
      </div>

      {/* Grid of 6 Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {exportCards.map((card) => {
          const Icon = card.icon;
          const isDownloading = downloadingFormat === card.id;

          return (
            <div
              key={card.id}
              className="bg-navy-900/90 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-5 shadow-glass flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-navy-950 font-bold shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {card.badge}
                  </span>
                </div>

                <h3 className="text-sm font-mono font-bold text-white group-hover:text-cyan-300 transition">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-sans">
                  {card.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 mt-4">
                <button
                  onClick={card.action}
                  className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-navy-950 text-slate-200 font-mono text-xs font-bold transition flex items-center justify-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isDownloading ? 'DOWNLOADING...' : `Export ${card.title.split(' ')[0]}`}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scientific Honesty Disclaimer Banner */}
      <div className="bg-navy-950/80 border border-amber-500/30 rounded-2xl p-4 shadow-glass text-xs font-mono text-amber-200/90 flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-amber-300">
            OFFICIAL SIH ACCURACY & REGULATORY NOTICE
          </div>
          <p className="text-[11px] leading-relaxed opacity-90 font-sans">
            "These values are AI-assisted estimates derived from single-view monocular optical perspectives and should not be treated as survey-grade or legal engineering measurements unless calibrated against appropriate geospatial reference data (e.g. Ground Control Points, LiDAR, or differential GPS)."
          </p>
        </div>
      </div>
    </div>
  );
};
