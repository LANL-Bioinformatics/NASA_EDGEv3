/* eslint-disable indent */
const path = require('path');
const fs = require('fs');
const Papa = require('papaparse');
const Upload = require('../edge-api/models/upload');
const config = require('../config');

const cromwellWorkflows = [];
const nextflowWorkflows = ['AmpIllumina'];
const nextflowConfigs = {
  executor_config: {
    slurm: 'slurm.config',
    local: 'local.config',
  },
  module_params: 'module_params.tmpl',
  container_config: 'container.config',
  nf_reports: 'nf_reports.tmpl',
};

const workflowList = {
  AmpIllumina: {
    outdir: 'output/AmpIllumina',
    nextflow_main: 'main.nf -profile slurm,singularity',
    config_tmpl: 'amplicon.tmpl',
  },
};

const linkUpload = async (fq, projHome) => {
  try {
    if (fq.startsWith(config.IO.UPLOADED_FILES_DIR)) {
      // create input dir and link uploaded file with realname
      const inputDir = `${projHome}/input`;
      if (!fs.existsSync(inputDir)) {
        fs.mkdirSync(inputDir);
      }
      const fileCode = path.basename(fq);
      let name = fileCode;
      const upload = await Upload.findOne({ 'code': name });
      if (upload) {
        name = upload.name;
      }
      let linkFq = `${inputDir}/${name}`;
      let i = 1;
      while (fs.existsSync(linkFq)) {
        i += 1;
        if (name.includes('.')) {
          const newName = name.replace('.', `${i}.`);
          linkFq = `${inputDir}/${newName}`;
        } else {
          linkFq = `${inputDir}/${name}${i}`;
        }
      }
      fs.symlinkSync(fq, linkFq, 'file');
      return linkFq;
    }
    return fq;
  } catch (err) {
    return Promise.reject(err);
  }
};

const generateWorkflowResult = (proj) => {
  const projHome = `${config.IO.PROJECT_BASE_DIR}/${proj.code}`;
  const resultJson = `${projHome}/result.json`;

  if (!fs.existsSync(resultJson)) {
    const result = {};
    const projectConf = JSON.parse(fs.readFileSync(`${projHome}/conf.json`));
    const outdir = `${projHome}/${workflowList[projectConf.workflow.name].outdir}`;

    if (projectConf.workflow.name === 'sra2fastq') {
      // use relative path
      const { accessions } = projectConf.workflow.input;
      accessions.forEach((accession) => {
        // link sra downloads to project output
        fs.symlinkSync(`../../../../sra/${accession}`, `${outdir}/${accession}`);

      });
    }

    if (projectConf.workflow.name === 'AmpIllumina') {
      result['Read Count Tracking'] = Papa.parse(fs.readFileSync(`${outdir}/workflow_output/Final_Outputs/read-count-tracking_GLAmpSeq.tsv`).toString(), { delimiter: '\t', header: true, skipEmptyLines: true }).data;
      result['Taxonomy and Counts'] = Papa.parse(fs.readFileSync(`${outdir}/workflow_output/Final_Outputs/taxonomy-and-counts_GLAmpSeq.tsv`).toString(), { delimiter: '\t', header: true, skipEmptyLines: true }).data;
      // get tabs' content
      result.alpha_diversity = {
        plots: [`${workflowList[projectConf.workflow.name].outdir}/workflow_output/Final_Outputs/alpha_diversity/rarefaction_curves_GLAmpSeq.png`,
        `${workflowList[projectConf.workflow.name].outdir}/workflow_output/Final_Outputs/alpha_diversity/richness_and_diversity_estimates_by_group_GLAmpSeq.png`,
        `${workflowList[projectConf.workflow.name].outdir}/workflow_output/Final_Outputs/alpha_diversity/richness_and_diversity_estimates_by_sample_GLAmpSeq.png`,
        ],
        statistics: Papa.parse(fs.readFileSync(`${outdir}/workflow_output/Final_Outputs/alpha_diversity/statistics_table_GLAmpSeq.csv`).toString(), { delimiter: ',', header: true, skipEmptyLines: true }).data,
        summary: Papa.parse(fs.readFileSync(`${outdir}/workflow_output/Final_Outputs/alpha_diversity/summary_table_GLAmpSeq.csv`).toString(), { delimiter: ',', header: true, skipEmptyLines: true }).data
      };
      result.beta_diversity = {
        'Bray-Curtis dissimilarity': {
          plots: [`${workflowList[projectConf.workflow.name].outdir}/workflow_output/Final_Outputs/beta_diversity/bray_PCoA_w_labels_GLAmpSeq.png`,
          `${workflowList[projectConf.workflow.name].outdir}/workflow_output/Final_Outputs/beta_diversity/bray_PCoA_without_labels_GLAmpSeq.png`,
          `${workflowList[projectConf.workflow.name].outdir}/workflow_output/Final_Outputs/beta_diversity/bray_dendrogram_GLAmpSeq.png`,
          ],
          'adonis statistics': Papa.parse(fs.readFileSync(`${outdir}/workflow_output/Final_Outputs/beta_diversity/bray_adonis_table_GLAmpSeq.csv`).toString(), { delimiter: ',', header: true, skipEmptyLines: true }).data,
          'variance statistics': Papa.parse(fs.readFileSync(`${outdir}/workflow_output/Final_Outputs/beta_diversity/bray_variance_table_GLAmpSeq.csv`).toString(), { delimiter: ',', header: true, skipEmptyLines: true }).data
        },
        'Euclidean distance': {
          plots: [`${workflowList[projectConf.workflow.name].outdir}/workflow_output/Final_Outputs/beta_diversity/euclidean_PCoA_w_labels_GLAmpSeq.png`,
          `${workflowList[projectConf.workflow.name].outdir}/workflow_output/Final_Outputs/beta_diversity/euclidean_PCoA_without_labels_GLAmpSeq.png`,
          `${workflowList[projectConf.workflow.name].outdir}/workflow_output/Final_Outputs/beta_diversity/euclidean_dendrogram_GLAmpSeq.png`,
          `${workflowList[projectConf.workflow.name].outdir}/workflow_output/Final_Outputs/beta_diversity/vsd_validation_plot_GLAmpSeq.png`
          ],
          'adonis statistics': Papa.parse(fs.readFileSync(`${outdir}/workflow_output/Final_Outputs/beta_diversity/euclidean_adonis_table_GLAmpSeq.csv`).toString(), { delimiter: ',', header: true, skipEmptyLines: true }).data,
          'variance statistics': Papa.parse(fs.readFileSync(`${outdir}/workflow_output/Final_Outputs/beta_diversity/euclidean_variance_table_GLAmpSeq.csv`).toString(), { delimiter: ',', header: true, skipEmptyLines: true }).data
        }
      };
      result.taxonomy = {
        'by Phylum': {
          plots: [`${workflowList[projectConf.workflow.name].outdir}/workflow_output/Final_Outputs/taxonomy_plots/groups_phylum_GLAmpSeq.png`,
          `${workflowList[projectConf.workflow.name].outdir}/workflow_output/Final_Outputs/taxonomy_plots/samples_phylum_GLAmpSeq.png`]
        },
        'by Class': {
          plots: [`${workflowList[projectConf.workflow.name].outdir}/workflow_output/Final_Outputs/taxonomy_plots/groups_class_GLAmpSeq.png`,
          `${workflowList[projectConf.workflow.name].outdir}/workflow_output/Final_Outputs/taxonomy_plots/samples_class_GLAmpSeq.png`]
        },
        'by Order': {
          plots: [`${workflowList[projectConf.workflow.name].outdir}/workflow_output/Final_Outputs/taxonomy_plots/groups_order_GLAmpSeq.png`,
          `${workflowList[projectConf.workflow.name].outdir}/workflow_output/Final_Outputs/taxonomy_plots/samples_order_GLAmpSeq.png`]
        },
        'by Family': {
          plots: [`${workflowList[projectConf.workflow.name].outdir}/workflow_output/Final_Outputs/taxonomy_plots/groups_family_GLAmpSeq.png`,
          `${workflowList[projectConf.workflow.name].outdir}/workflow_output/Final_Outputs/taxonomy_plots/samples_family_GLAmpSeq.png`]
        },
        'by Genus': {
          plots: [`${workflowList[projectConf.workflow.name].outdir}/workflow_output/Final_Outputs/taxonomy_plots/groups_genus_GLAmpSeq.png`,
          `${workflowList[projectConf.workflow.name].outdir}/workflow_output/Final_Outputs/taxonomy_plots/samples_genus_GLAmpSeq.png`]
        },
        'by Species': {
          plots: [`${workflowList[projectConf.workflow.name].outdir}/workflow_output/Final_Outputs/taxonomy_plots/groups_species_GLAmpSeq.png`,
          `${workflowList[projectConf.workflow.name].outdir}/workflow_output/Final_Outputs/taxonomy_plots/samples_species_GLAmpSeq.png`]
        },
      };

      result.differential_abundance = {
        ANCOMBC1: {
          plots: ['need find all ANCOMBC1 plots'],
          'Sample Info': Papa.parse(fs.readFileSync(`${outdir}/workflow_output/Final_Outputs/differential_abundance/SampleTable_GLAmpSeq.csv`).toString(), { delimiter: ',', header: true, skipEmptyLines: true }).data,
          'Pairwise Contrasts': Papa.parse(fs.readFileSync(`${outdir}/workflow_output/Final_Outputs/differential_abundance/contrasts_GLAmpSeq.csv`).toString(), { delimiter: ',', header: true, skipEmptyLines: true }).data,
          'Differential Abundance': Papa.parse(fs.readFileSync(`${outdir}/workflow_output/Final_Outputs/differential_abundance/ancombc1/ancombc1_differential_abundance_GLAmpSeq.csv`).toString(), { delimiter: ',', header: true, skipEmptyLines: true }).data,
        },
        ANCOMBC2: {
          plots: ['need find all ANCOMBC2 plots'],
          'Sample Info': Papa.parse(fs.readFileSync(`${outdir}/workflow_output/Final_Outputs/differential_abundance/SampleTable_GLAmpSeq.csv`).toString(), { delimiter: ',', header: true, skipEmptyLines: true }).data,
          'Pairwise Contrasts': Papa.parse(fs.readFileSync(`${outdir}/workflow_output/Final_Outputs/differential_abundance/contrasts_GLAmpSeq.csv`).toString(), { delimiter: ',', header: true, skipEmptyLines: true }).data,
          'Differential Abundance': Papa.parse(fs.readFileSync(`${outdir}/workflow_output/Final_Outputs/differential_abundance/ancombc2/ancombc2_differential_abundance_GLAmpSeq.csv`).toString(), { delimiter: ',', header: true, skipEmptyLines: true }).data,
        },
        DESeq2: {
          plots: ['need find all DESeq2 plots'],
          'Sample Info': Papa.parse(fs.readFileSync(`${outdir}/workflow_output/Final_Outputs/differential_abundance/SampleTable_GLAmpSeq.csv`).toString(), { delimiter: ',', header: true, skipEmptyLines: true }).data,
          'Pairwise Contrasts': Papa.parse(fs.readFileSync(`${outdir}/workflow_output/Final_Outputs/differential_abundance/contrasts_GLAmpSeq.csv`).toString(), { delimiter: ',', header: true, skipEmptyLines: true }).data,
          'Differential Abundance': Papa.parse(fs.readFileSync(`${outdir}/workflow_output/Final_Outputs/differential_abundance/deseq2/deseq2_differential_abundance_GLAmpSeq.csv`).toString(), { delimiter: ',', header: true, skipEmptyLines: true }).data,
        },
      };
      result.differential_abundance.ANCOMBC1.plots = [];
      result.differential_abundance.ANCOMBC2.plots = [];
      result.differential_abundance.DESeq2.plots = [];
      const plotReg = /_(.*).png$/;
      let plotDir = 'workflow_output/Final_Outputs/differential_abundance/ancombc1';
      let plots = fs.readdirSync(`${outdir}/${plotDir}`);
      plots.forEach((plot) => {
        if (plotReg.test(plot)) {
          result.differential_abundance.ANCOMBC1.plots.push(
            `${workflowList[projectConf.workflow.name].outdir}/${plotDir}/${plot}`);
        }
      });
      plotDir = 'workflow_output/Final_Outputs/differential_abundance/ancombc2';
      plots = fs.readdirSync(`${outdir}/${plotDir}`);
      plots.forEach((plot) => {
        if (plotReg.test(plot)) {
          result.differential_abundance.ANCOMBC2.plots.push(
            `${workflowList[projectConf.workflow.name].outdir}/${plotDir}/${plot}`);
        }
      });
      plotDir = 'workflow_output/Final_Outputs/differential_abundance/deseq2';
      plots = fs.readdirSync(`${outdir}/${plotDir}`);
      plots.forEach((plot) => {
        if (plotReg.test(plot)) {
          result.differential_abundance.DESeq2.plots.push(
            `${workflowList[projectConf.workflow.name].outdir}/${plotDir}/${plot}`);
        }
      });
    }

    fs.writeFileSync(resultJson, JSON.stringify(result));
  }
};

module.exports = {
  cromwellWorkflows,
  nextflowWorkflows,
  nextflowConfigs,
  workflowList,
  linkUpload,
  generateWorkflowResult,
};
