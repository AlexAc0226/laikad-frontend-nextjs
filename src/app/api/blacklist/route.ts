import { NextRequest, NextResponse } from 'next/server';
import { getBlacklist, createOrUpdateBlacklist } from '@/libs/blacklist';

export async function GET(req: NextRequest) {
  const accessToken = req.headers.get('access-token') || '';
  if (!accessToken) {
    return NextResponse.json({ error: 'Access token required' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const params = {
    BlackListID: searchParams.get('BlackListID') || '',
    OfferID: searchParams.get('OfferID') || '',
    SubPubID: searchParams.get('SubPubID') || '',
    DateFrom: searchParams.get('DateFrom') || '',
    DateTo: searchParams.get('DateTo') || '',
    AdvertiserID: searchParams.get('AdvertiserID') || '',
    CampaignID: searchParams.get('CampaignID') || '',
    SupplierID: searchParams.get('SupplierID') || '',
    StatusID: searchParams.get('StatusID') || '',
    ListType: searchParams.get('ListType') || 'BL',
    isIP: Number(searchParams.get('isIP') || '0'),
  };

  try {
    const result = await getBlacklist(
      params.BlackListID,
      params.OfferID,
      params.SubPubID,
      params.DateFrom,
      params.DateTo,
      params.AdvertiserID,
      params.CampaignID,
      params.SupplierID,
      params.StatusID,
      params.ListType,
      params.isIP,
      accessToken
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching blacklist:', error);
    return NextResponse.json({ error: 'Error fetching blacklist' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const accessToken = req.headers.get('access-token') || '';
  if (!accessToken) {
    return NextResponse.json({ error: 'Access token required' }, { status: 401 });
  }

  const body = await req.json();
  const {
    BlackListID = '',
    OfferID = '',
    SubPubID = '',
    DateFrom = '',
    DateTo = '',
    AdvertiserID = '',
    CampaignID = '',
    SupplierID = '',
    StatusID = 'A',
    ListType = 'BL',
    isIP = 0,
    Status = 0,
    Reason = '',
  } = body;

  try {
    const result = await createOrUpdateBlacklist(
      'POST',
      BlackListID,
      OfferID,
      SubPubID,
      DateFrom,
      DateTo,
      AdvertiserID,
      CampaignID,
      SupplierID,
      StatusID,
      ListType,
      isIP,
      Status,
      Reason,
      accessToken
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating/updating blacklist:', error);
    return NextResponse.json({ error: 'Error creating/updating blacklist' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const accessToken = req.headers.get('access-token') || '';
  if (!accessToken) {
    return NextResponse.json({ error: 'Access token required' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const BlackListID = searchParams.get('BlackListID') || '';

  if (!BlackListID) {
    return NextResponse.json({ error: 'BlackListID is required' }, { status: 400 });
  }

  try {
    const result = await createOrUpdateBlacklist(
      'DELETE',
      BlackListID,
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      'BL',
      0,
      0,
      '',
      accessToken
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting blacklist:', error);
    return NextResponse.json({ error: 'Error deleting blacklist' }, { status: 500 });
  }
}