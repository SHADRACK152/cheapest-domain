'use client';

import { motion } from 'framer-motion';
import { Layers, Plus, FileText, Globe, Tag, Hash, Type, ToggleLeft, Calendar, Link2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const COLLECTION_TYPES = [
  {
    name: 'Blog Post',
    apiId: 'blog-post',
    description: 'Articles and news content published to the blog',
    fields: 12,
    icon: FileText,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    name: 'TLD Entry',
    apiId: 'tld-entry',
    description: 'Top-level domain pricing, registrar and metadata',
    fields: 9,
    icon: Globe,
    color: 'bg-green-50 text-green-600',
  },
  {
    name: 'Tag',
    apiId: 'tag',
    description: 'Taxonomy labels for organising content',
    fields: 3,
    icon: Tag,
    color: 'bg-orange-50 text-orange-600',
  },
];

const FIELD_TYPES = [
  { name: 'Text',     icon: Type,        desc: 'Short or long text strings'    },
  { name: 'Number',   icon: Hash,        desc: 'Integer or decimal values'      },
  { name: 'Boolean',  icon: ToggleLeft,  desc: 'True / False toggle'            },
  { name: 'Date',     icon: Calendar,    desc: 'Date & time picker'             },
  { name: 'Relation', icon: Link2,       desc: 'Link to another content type'   },
];

export default function AdminContentTypesPage() {
  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Layers className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Content Type Builder</h1>
              <p className="text-sm text-gray-500 mt-0.5">Define and manage your content schemas</p>
            </div>
          </div>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4" />
            New Content Type
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Collection Types */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Collection Types ({COLLECTION_TYPES.length})
            </h2>
            {COLLECTION_TYPES.map((type, i) => (
              <motion.div
                key={type.apiId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 hover:border-blue-200 hover:shadow-sm transition-all group cursor-pointer"
              >
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', type.color)}>
                  <type.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{type.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{type.description}</p>
                </div>
                <div className="text-right mr-3">
                  <p className="text-sm font-bold text-gray-800">{type.fields}</p>
                  <p className="text-xs text-gray-400">fields</p>
                </div>
                <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full font-mono hidden sm:block">
                  {type.apiId}
                </span>
                <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                  <Pencil className="h-4 w-4" />
                </button>
              </motion.div>
            ))}

            {/* Add new placeholder */}
            <button className="w-full border-2 border-dashed border-gray-200 rounded-xl p-5 flex items-center gap-3 text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/30 transition-all">
              <Plus className="h-5 w-5" />
              <span className="text-sm font-medium">Add a new collection type</span>
            </button>
          </div>

          {/* Right panel */}
          <div className="space-y-5">
            {/* Field Types palette */}
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Available Field Types</h2>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {FIELD_TYPES.map((ft, i) => (
                  <div
                    key={ft.name}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-default',
                      i !== FIELD_TYPES.length - 1 && 'border-b border-gray-100'
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <ft.icon className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{ft.name}</p>
                      <p className="text-xs text-gray-400">{ft.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info card */}
            <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
              <p className="text-xs font-semibold text-blue-700 mb-1">Pro tip</p>
              <p className="text-xs text-blue-600 leading-relaxed">
                Changes to content types automatically update the API endpoints and admin forms. Published content is not affected.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
