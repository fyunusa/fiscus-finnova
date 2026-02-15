'use client';

import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, Button, Input } from '@/components/ui';
import { Edit2, Check, X } from 'lucide-react';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: '김철수',
    email: 'kim.chulsu@example.com',
    phone: '010-1234-5678',
    address: '서울시 강남구 테헤란로 123',
    birthDate: '1990-05-15',
    gender: '남'
  });

  const [editForm, setEditForm] = useState(profile);

  const handleSave = () => {
    setProfile(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-4xl font-bold">프로필 관리</h1>
            <p className="text-blue-100 mt-2">개인 정보를 확인하고 수정하세요</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <Card className="bg-white shadow-md p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">김</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                  <p className="text-gray-600">{profile.email}</p>
                </div>
              </div>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  <Edit2 size={18} />
                  수정
                </Button>
              )}
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                  {isEditing ? (
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="w-full px-4 py-2 border rounded"
                    />
                  ) : (
                    <p className="px-4 py-2 text-gray-900 font-semibold">{profile.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">성별</label>
                  {isEditing ? (
                    <select
                      value={editForm.gender}
                      onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                      className="w-full px-4 py-2 border rounded"
                    >
                      <option>남</option>
                      <option>여</option>
                    </select>
                  ) : (
                    <p className="px-4 py-2 text-gray-900 font-semibold">{profile.gender}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                  {isEditing ? (
                    <Input
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="w-full px-4 py-2 border rounded"
                    />
                  ) : (
                    <p className="px-4 py-2 text-gray-900 font-semibold">{profile.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">휴대폰</label>
                  {isEditing ? (
                    <Input
                      value={editForm.phone}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full px-4 py-2 border rounded"
                    />
                  ) : (
                    <p className="px-4 py-2 text-gray-900 font-semibold">{profile.phone}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">주소</label>
                  {isEditing ? (
                    <Input
                      value={editForm.address}
                      onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                      className="w-full px-4 py-2 border rounded"
                    />
                  ) : (
                    <p className="px-4 py-2 text-gray-900 font-semibold">{profile.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">생년월일</label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editForm.birthDate}
                      onChange={(e) => setEditForm({...editForm, birthDate: e.target.value})}
                      className="w-full px-4 py-2 border rounded"
                    />
                  ) : (
                    <p className="px-4 py-2 text-gray-900 font-semibold">{profile.birthDate}</p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-4 justify-end pt-4 border-t">
                  <Button
                    onClick={handleCancel}
                    className="flex items-center gap-2 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                  >
                    <X size={18} />
                    취소
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    <Check size={18} />
                    저장
                  </Button>
                </div>
              )}
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
